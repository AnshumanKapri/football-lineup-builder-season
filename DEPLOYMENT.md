# Permanent Hosting Notes

This app now runs as a Node web server with WebSocket multiplayer and account-based saved progress.

## Run Locally

```bash
npm start
```

Open:

```text
http://localhost:3000?room=DREAMXI
```

## Chosen Permanent Host: Render

This project is set up for Render because it supports:

- Node.js
- WebSocket connections
- Persistent disks for saved accounts/progress
- Public HTTPS URLs

The included `render.yaml` creates:

- A Node web service
- A 1 GB persistent disk mounted at `/var/data`
- `DATA_DIR=/var/data`
- Health checks at `/api/health`

## Deploy On Render

1. Put this folder in a GitHub repository.
2. Open Render.
3. Choose **New > Blueprint**.
4. Connect the repository.
5. Render will read `render.yaml`.
6. Deploy the blueprint.

Render will provide a permanent `onrender.com` URL. Friends can open that URL from any network.

Start command used by Render:

```text
npm start
```

Environment variables:

```text
DATA_DIR=/var/data
```

Render injects `PORT` automatically. The server already reads `process.env.PORT`.

## Login And Saved Progress

Accounts are saved server-side in:

```text
data/app-data.json
```

Passwords are hashed with Node's built-in `crypto.scrypt`. Sessions use httpOnly cookies. If the server restarts, users may need to log in again, but their progress remains saved as long as the `data/` folder is persistent.

## Important

Temporary tunnels such as localtunnel/ngrok work for testing, but they are not permanent. For a permanent public URL, deploy to a cloud host or VPS and keep `DATA_DIR` on persistent storage.
