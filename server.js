const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const os = require("os");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "0.0.0.0";
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "app-data.json");
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const MAX_BODY_BYTES = 1024 * 1024;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const staticRoutes = new Set(["/", "/index.html", "/styles.css", "/app.js"]);
const rooms = new Map();
const sessions = new Map();
let db = loadDatabase();

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (requestUrl.pathname.startsWith("/api/")) {
    handleApi(request, response, requestUrl).catch((error) => {
      console.error(error);
      sendJsonResponse(response, 500, { error: "Server error." });
    });
    return;
  }

  serveStatic(requestUrl, response);
});

server.on("upgrade", (request, socket) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (requestUrl.pathname !== "/ws") {
    socket.destroy();
    return;
  }

  const key = request.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }

  const accept = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");

  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${accept}`,
      "",
      "",
    ].join("\r\n"),
  );

  const roomId = normalizeRoomId(requestUrl.searchParams.get("room") || "DREAMXI");
  const room = getRoom(roomId);
  const client = {
    id: crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(8).toString("hex"),
    socket,
    roomId,
    buffer: Buffer.alloc(0),
  };

  room.clients.add(client);

  socket.on("data", (chunk) => handleSocketData(client, chunk));
  socket.on("close", () => removeClient(client));
  socket.on("end", () => removeClient(client));
  socket.on("error", () => removeClient(client));
});

server.listen(PORT, HOST, () => {
  console.log(`Football Command Center running at http://localhost:${PORT}`);
  getLanUrls(PORT).forEach((url) => console.log(`LAN: ${url}`));
  console.log("For permanent public play, deploy this Node app to an always-on host.");
});

function serveStatic(requestUrl, response) {
  if (!staticRoutes.has(requestUrl.pathname)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }

  const requestedPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const filePath = path.normalize(path.join(ROOT, requestedPath));

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(data);
  });
}

async function handleApi(request, response, requestUrl) {
  const method = request.method || "GET";

  if (requestUrl.pathname === "/api/health" && method === "GET") {
    sendJsonResponse(response, 200, { ok: true });
    return;
  }

  if (requestUrl.pathname === "/api/me" && method === "GET") {
    const user = getRequestUser(request);
    sendJsonResponse(response, 200, user ? { user: publicUser(user) } : { user: null });
    return;
  }

  if (requestUrl.pathname === "/api/register" && method === "POST") {
    const body = await readJsonBody(request);
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");

    if (!isValidUsername(username)) {
      sendJsonResponse(response, 400, { error: "Use 3-20 letters, numbers, underscore, or hyphen." });
      return;
    }

    if (password.length < 6) {
      sendJsonResponse(response, 400, { error: "Password must be at least 6 characters." });
      return;
    }

    if (db.users[username]) {
      sendJsonResponse(response, 409, { error: "That username is already taken." });
      return;
    }

    const user = createUser(username, password);
    db.users[username] = user;
    saveDatabase();
    createSession(response, request, user);
    sendJsonResponse(response, 201, { user: publicUser(user), progress: user.progress || null });
    return;
  }

  if (requestUrl.pathname === "/api/login" && method === "POST") {
    const body = await readJsonBody(request);
    const username = normalizeUsername(body.username);
    const password = String(body.password || "");
    const user = db.users[username];

    if (!user || !verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      sendJsonResponse(response, 401, { error: "Username or password is incorrect." });
      return;
    }

    createSession(response, request, user);
    sendJsonResponse(response, 200, { user: publicUser(user), progress: user.progress || null });
    return;
  }

  if (requestUrl.pathname === "/api/logout" && method === "POST") {
    const token = parseCookies(request.headers.cookie || "").session;
    if (token) sessions.delete(token);
    clearSessionCookie(response, request);
    sendJsonResponse(response, 200, { ok: true });
    return;
  }

  if (requestUrl.pathname === "/api/progress" && method === "GET") {
    const user = getRequestUser(request);
    if (!user) {
      sendJsonResponse(response, 401, { error: "Login required." });
      return;
    }
    sendJsonResponse(response, 200, { progress: user.progress || null });
    return;
  }

  if (requestUrl.pathname === "/api/progress" && method === "PUT") {
    const user = getRequestUser(request);
    if (!user) {
      sendJsonResponse(response, 401, { error: "Login required." });
      return;
    }

    const body = await readJsonBody(request);
    if (!body.state || typeof body.state !== "object") {
      sendJsonResponse(response, 400, { error: "Missing progress state." });
      return;
    }

    user.progress = {
      ...body.state,
      savedAt: new Date().toISOString(),
    };
    user.updatedAt = new Date().toISOString();
    saveDatabase();
    sendJsonResponse(response, 200, { ok: true, progress: user.progress });
    return;
  }

  sendJsonResponse(response, 404, { error: "Not found." });
}

function createUser(username, password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(12).toString("hex"),
    username,
    passwordSalt: salt,
    passwordHash: hashPassword(password, salt),
    progress: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password, salt, expectedHash) {
  const actual = Buffer.from(hashPassword(password, salt), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function createSession(response, request, user) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    username: user.username,
    expiresAt: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });
  response.setHeader("Set-Cookie", buildSessionCookie(request, `session=${token}; Max-Age=${SESSION_MAX_AGE_SECONDS}`));
}

function clearSessionCookie(response, request) {
  response.setHeader("Set-Cookie", buildSessionCookie(request, "session=; Max-Age=0"));
}

function buildSessionCookie(request, baseCookie) {
  const secure = isHttpsRequest(request) ? "; Secure" : "";
  return `${baseCookie}; Path=/; HttpOnly; SameSite=Lax${secure}`;
}

function getRequestUser(request) {
  const token = parseCookies(request.headers.cookie || "").session;
  const session = token ? sessions.get(token) : null;
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }

  return db.users[session.username] || null;
}

function publicUser(user) {
  return {
    id: user.id,
    username: user.username,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function parseCookies(cookieHeader) {
  return cookieHeader.split(";").reduce((cookies, pair) => {
    const [rawKey, ...valueParts] = pair.trim().split("=");
    if (!rawKey) return cookies;
    cookies[rawKey] = decodeURIComponent(valueParts.join("=") || "");
    return cookies;
  }, {});
}

function normalizeUsername(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidUsername(username) {
  return /^[a-z0-9_-]{3,20}$/.test(username);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(new Error("Body too large"));
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    request.on("error", reject);
  });
}

function sendJsonResponse(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function loadDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_PATH)) {
    const initialDb = { users: {} };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialDb, null, 2));
    return initialDb;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    return {
      users: parsed.users && typeof parsed.users === "object" ? parsed.users : {},
    };
  } catch {
    return { users: {} };
  }
}

function saveDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmpPath = `${DB_PATH}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(db, null, 2));
  fs.renameSync(tmpPath, DB_PATH);
}

function isHttpsRequest(request) {
  return request.socket.encrypted || request.headers["x-forwarded-proto"] === "https";
}

function handleSocketData(client, chunk) {
  client.buffer = Buffer.concat([client.buffer, chunk]);

  while (client.buffer.length >= 2) {
    const frame = readFrame(client.buffer);
    if (!frame) return;

    client.buffer = client.buffer.slice(frame.consumed);

    if (frame.opcode === 0x8) {
      client.socket.end();
      removeClient(client);
      return;
    }

    if (frame.opcode === 0x9) {
      sendFrame(client.socket, frame.payload, 0xA);
      continue;
    }

    if (frame.opcode !== 0x1) continue;

    try {
      handleClientMessage(client, JSON.parse(frame.payload.toString("utf8")));
    } catch {
      sendJson(client, { type: "server:error", message: "Invalid message." });
    }
  }
}

function handleClientMessage(client, message) {
  const room = rooms.get(client.roomId);
  if (!room) return;

  if (message.type === "join") {
    client.publicId = String(message.clientId || client.id);
    if (!room.state && message.state) {
      room.state = message.state;
    }
    sendJson(client, { type: "snapshot", state: room.state || null, peers: room.clients.size });
    broadcastPresence(room);
    return;
  }

  if (message.type === "state:update" && message.state) {
    room.state = message.state;
    broadcastJson(
      room,
      {
        type: "state:update",
        clientId: String(message.clientId || client.publicId || client.id),
        state: room.state,
        peers: room.clients.size,
      },
      client,
    );
  }
}

function readFrame(buffer) {
  const first = buffer[0];
  const second = buffer[1];
  const opcode = first & 0x0f;
  const masked = (second & 0x80) === 0x80;
  let length = second & 0x7f;
  let offset = 2;

  if (length === 126) {
    if (buffer.length < offset + 2) return null;
    length = buffer.readUInt16BE(offset);
    offset += 2;
  } else if (length === 127) {
    if (buffer.length < offset + 8) return null;
    const bigLength = buffer.readBigUInt64BE(offset);
    if (bigLength > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    length = Number(bigLength);
    offset += 8;
  }

  const maskLength = masked ? 4 : 0;
  if (buffer.length < offset + maskLength + length) return null;

  let mask;
  if (masked) {
    mask = buffer.slice(offset, offset + 4);
    offset += 4;
  }

  const payload = Buffer.from(buffer.slice(offset, offset + length));
  if (masked) {
    for (let index = 0; index < payload.length; index += 1) {
      payload[index] ^= mask[index % 4];
    }
  }

  return { opcode, payload, consumed: offset + length };
}

function sendJson(client, message) {
  sendFrame(client.socket, Buffer.from(JSON.stringify(message), "utf8"), 0x1);
}

function broadcastJson(room, message, exceptClient = null) {
  room.clients.forEach((client) => {
    if (client !== exceptClient) {
      sendJson(client, message);
    }
  });
}

function broadcastPresence(room) {
  broadcastJson(room, { type: "presence", peers: room.clients.size });
}

function sendFrame(socket, payload, opcode) {
  const length = payload.length;
  let header;

  if (length < 126) {
    header = Buffer.from([0x80 | opcode, length]);
  } else if (length < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(length), 2);
  }

  socket.write(Buffer.concat([header, payload]));
}

function removeClient(client) {
  const room = rooms.get(client.roomId);
  if (!room) return;

  room.clients.delete(client);
  if (room.clients.size === 0) {
    rooms.delete(client.roomId);
    return;
  }

  broadcastPresence(room);
}

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { clients: new Set(), state: null });
  }
  return rooms.get(roomId);
}

function normalizeRoomId(value) {
  return (
    String(value || "DREAMXI")
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "")
      .slice(0, 16) || "DREAMXI"
  );
}

function getLanUrls(port) {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((network) => network && network.family === "IPv4" && !network.internal)
    .map((network) => `http://${network.address}:${port}`);
}
