const STARTING_BUDGET = 1500;
const SAVE_KEY = "football-command-center-state-v1";
const ROOM_KEY = "football-command-center-room-v1";

let currentBudget = STARTING_BUDGET;
let isApplyingRemoteState = false;

const multiplayer = {
  socket: null,
  roomId: "",
  clientId: `coach-${Math.random().toString(36).slice(2, 10)}`,
  peers: 1,
  reconnectTimer: null,
};

const auth = {
  user: null,
  saveTimer: null,
  isSaving: false,
};

const SIM_CONFIG = {
  leagueAverage: 85,
  leagueGames: 38,
  winBase: 0.44,
  winSlope: 0.035,
  drawBase: 0.24,
  drawSlope: 0.006,
  minWinChance: 0.08,
  maxWinChance: 0.84,
  minDrawChance: 0.11,
  maxDrawChance: 0.28,
  upsetFloor: 0.09,
};

const rawPlayers = [
  { name: "Kylian Mbappe", position: "ST", ovr: 95, price: 185, status: "Real Star" },
  { name: "Erling Haaland", position: "ST", ovr: 95, price: 190, status: "Real Star" },
  { name: "Vinicius Junior", position: "LW", ovr: 94, price: 175, status: "Real Star" },
  { name: "Rodri", position: "CDM", ovr: 93, price: 150, status: "Real Star" },
  { name: "Jude Bellingham", position: "CAM", ovr: 92, price: 155, status: "Real Star" },
  { name: "Kevin De Bruyne", position: "CM", ovr: 91, price: 122, status: "Real Star" },
  { name: "Mohamed Salah", position: "RW", ovr: 91, price: 130, status: "Real Star" },
  { name: "Harry Kane", position: "ST", ovr: 91, price: 125, status: "Real Star" },
  { name: "Thibaut Courtois", position: "GK", ovr: 91, price: 88, status: "Real Star" },
  { name: "Jamal Musiala", position: "CAM", ovr: 90, price: 118, status: "Real Star" },
  { name: "Florian Wirtz", position: "CAM", ovr: 90, price: 120, status: "Real Star" },
  { name: "Lautaro Martinez", position: "ST", ovr: 90, price: 112, status: "Real Star" },
  { name: "Virgil van Dijk", position: "CB", ovr: 90, price: 96, status: "Real Star" },
  { name: "Alisson", position: "GK", ovr: 90, price: 82, status: "Real Star" },
  { name: "Federico Valverde", position: "CM", ovr: 89, price: 102, status: "Real Star" },
  { name: "Martin Odegaard", position: "CAM", ovr: 89, price: 104, status: "Real Star" },
  { name: "Bukayo Saka", position: "RW", ovr: 89, price: 105, status: "Real Star" },
  { name: "Robert Lewandowski", position: "ST", ovr: 89, price: 92, status: "Real Star" },
  { name: "Ruben Dias", position: "CB", ovr: 89, price: 86, status: "Real Star" },
  { name: "Ederson", position: "GK", ovr: 89, price: 72, status: "Real Star" },
  { name: "Marc-Andre ter Stegen", position: "GK", ovr: 89, price: 76, status: "Real Star" },
  { name: "Phil Foden", position: "CAM", ovr: 89, price: 110, status: "Real Star" },
  { name: "Pedri", position: "CM", ovr: 88, price: 92, status: "Real Star" },
  { name: "Nicolo Barella", position: "CM", ovr: 88, price: 86, status: "Real Star" },
  { name: "Joshua Kimmich", position: "CDM", ovr: 88, price: 88, status: "Real Star" },
  { name: "Bruno Fernandes", position: "CAM", ovr: 88, price: 86, status: "Real Star" },
  { name: "Bernardo Silva", position: "CM", ovr: 88, price: 88, status: "Real Star" },
  { name: "Heung Min Son", position: "LW", ovr: 88, price: 85, status: "Real Star" },
  { name: "Antoine Griezmann", position: "CF", ovr: 88, price: 78, status: "Real Star" },
  { name: "Victor Osimhen", position: "ST", ovr: 88, price: 96, status: "Real Star" },
  { name: "Neymar Jr", position: "LW", ovr: 88, price: 78, status: "Real Star" },
  { name: "Lionel Messi", position: "RW", ovr: 88, price: 70, status: "Real Star" },
  { name: "Gianluigi Donnarumma", position: "GK", ovr: 88, price: 66, status: "Real Star" },
  { name: "Mike Maignan", position: "GK", ovr: 88, price: 64, status: "Real Star" },
  { name: "Jan Oblak", position: "GK", ovr: 88, price: 68, status: "Real Star" },
  { name: "William Saliba", position: "CB", ovr: 88, price: 78, status: "Real Star" },
  { name: "Frenkie de Jong", position: "CM", ovr: 87, price: 80, status: "Real Star" },
  { name: "Aurelien Tchouameni", position: "CDM", ovr: 87, price: 80, status: "Real Star" },
  { name: "Declan Rice", position: "CDM", ovr: 87, price: 82, status: "Real Star" },
  { name: "Luka Modric", position: "CM", ovr: 87, price: 58, status: "Real Star" },
  { name: "Rafael Leao", position: "LW", ovr: 87, price: 82, status: "Real Star" },
  { name: "Rodrygo", position: "RW", ovr: 87, price: 82, status: "Real Star" },
  { name: "Khvicha Kvaratskhelia", position: "LW", ovr: 87, price: 78, status: "Real Star" },
  { name: "Cole Palmer", position: "RW", ovr: 87, price: 80, status: "Real Star" },
  { name: "Viktor Gyokeres", position: "ST", ovr: 87, price: 84, status: "Real Star" },
  { name: "Lamine Yamal", position: "RW", ovr: 87, price: 90, status: "Real Star" },
  { name: "Ronald Araujo", position: "CB", ovr: 87, price: 76, status: "Real Star" },
  { name: "Alessandro Bastoni", position: "CB", ovr: 87, price: 72, status: "Real Star" },
  { name: "Antonio Rudiger", position: "CB", ovr: 87, price: 72, status: "Real Star" },
  { name: "Trent Alexander-Arnold", position: "RB", ovr: 87, price: 75, status: "Real Star" },
  { name: "Theo Hernandez", position: "LB", ovr: 87, price: 74, status: "Real Star" },
  { name: "Gregor Kobel", position: "GK", ovr: 87, price: 62, status: "Real Star" },
  { name: "Eduardo Camavinga", position: "CM", ovr: 86, price: 72, status: "Real Star" },
  { name: "Alexis Mac Allister", position: "CM", ovr: 86, price: 64, status: "Real Star" },
  { name: "Vitinha", position: "CM", ovr: 86, price: 66, status: "Real Star" },
  { name: "Hakan Calhanoglu", position: "CDM", ovr: 86, price: 62, status: "Real Star" },
  { name: "Julian Alvarez", position: "ST", ovr: 86, price: 72, status: "Real Star" },
  { name: "Alexander Isak", position: "ST", ovr: 86, price: 74, status: "Real Star" },
  { name: "Luis Diaz", position: "LW", ovr: 86, price: 68, status: "Real Star" },
  { name: "Ousmane Dembele", position: "RW", ovr: 86, price: 66, status: "Real Star" },
  { name: "Raphinha", position: "RW", ovr: 86, price: 68, status: "Real Star" },
  { name: "Nico Williams", position: "LW", ovr: 86, price: 70, status: "Real Star" },
  { name: "Cristiano Ronaldo", position: "ST", ovr: 86, price: 60, status: "Real Star" },
  { name: "Paulo Dybala", position: "CF", ovr: 86, price: 60, status: "Real Star" },
  { name: "Dusan Vlahovic", position: "ST", ovr: 86, price: 68, status: "Real Star" },
  { name: "Marquinhos", position: "CB", ovr: 86, price: 64, status: "Real Star" },
  { name: "Josko Gvardiol", position: "LB", ovr: 86, price: 70, status: "Real Star" },
  { name: "Achraf Hakimi", position: "RB", ovr: 86, price: 70, status: "Real Star" },
  { name: "Matthijs de Ligt", position: "CB", ovr: 86, price: 62, status: "Real Star" },
  { name: "Eder Militao", position: "CB", ovr: 86, price: 66, status: "Real Star" },
  { name: "Gabriel", position: "CB", ovr: 86, price: 62, status: "Real Star" },
  { name: "Ilkay Gundogan", position: "CM", ovr: 86, price: 55, status: "Real Star" },
  { name: "Dominik Szoboszlai", position: "CAM", ovr: 85, price: 56, status: "Real Star" },
  { name: "Gavi", position: "CM", ovr: 85, price: 62, status: "Real Star" },
  { name: "Martin Zubimendi", position: "CDM", ovr: 85, price: 54, status: "Real Star" },
  { name: "Sandro Tonali", position: "CDM", ovr: 85, price: 60, status: "Real Star" },
  { name: "Xavi Simons", position: "CAM", ovr: 85, price: 60, status: "Real Star" },
  { name: "Ollie Watkins", position: "ST", ovr: 85, price: 58, status: "Real Star" },
  { name: "Lois Openda", position: "ST", ovr: 85, price: 58, status: "Real Star" },
  { name: "Kai Havertz", position: "CF", ovr: 85, price: 58, status: "Real Star" },
  { name: "Yann Sommer", position: "GK", ovr: 85, price: 45, status: "Real Star" },
  { name: "Diogo Costa", position: "GK", ovr: 85, price: 48, status: "Real Star" },
  { name: "Kyle Walker", position: "RB", ovr: 85, price: 52, status: "Real Star" },
  { name: "Dani Carvajal", position: "RB", ovr: 85, price: 50, status: "Real Star" },
  { name: "Alejandro Grimaldo", position: "LB", ovr: 85, price: 54, status: "Real Star" },
  { name: "Federico Dimarco", position: "LWB", ovr: 85, price: 52, status: "Real Star" },
  { name: "John Stones", position: "CB", ovr: 85, price: 58, status: "Real Star" },
  { name: "Enzo Fernandez", position: "CM", ovr: 85, price: 58, status: "Real Star" },
  { name: "Joao Cancelo", position: "RB", ovr: 86, price: 60, status: "Real Star" },
  { name: "James Maddison", position: "CAM", ovr: 84, price: 45, status: "Real Star" },
  { name: "Joao Palhinha", position: "CDM", ovr: 84, price: 46, status: "Real Star" },
  { name: "Marcus Rashford", position: "LW", ovr: 84, price: 50, status: "Real Star" },
  { name: "Federico Chiesa", position: "RW", ovr: 84, price: 46, status: "Real Star" },
  { name: "Victor Boniface", position: "ST", ovr: 84, price: 48, status: "Real Star" },
  { name: "Jeremy Doku", position: "LW", ovr: 84, price: 50, status: "Real Star" },
  { name: "Unai Simon", position: "GK", ovr: 84, price: 42, status: "Real Star" },
  { name: "Reece James", position: "RB", ovr: 84, price: 46, status: "Real Star" },
  { name: "Andrew Robertson", position: "LB", ovr: 84, price: 48, status: "Real Star" },
  { name: "Dayot Upamecano", position: "CB", ovr: 84, price: 48, status: "Real Star" },
  { name: "Lisandro Martinez", position: "CB", ovr: 84, price: 45, status: "Real Star" },
  { name: "Karim Adeyemi", position: "LW", ovr: 83, price: 42, status: "Real Star" },
  { name: "Alejandro Garnacho", position: "LW", ovr: 82, price: 38, status: "Real Star" },
  { name: "Pele", position: "CF", ovr: 95, price: 190, status: "Icon" },
  { name: "Diego Maradona", position: "CAM", ovr: 95, price: 188, status: "Icon" },
  { name: "Ronaldo Nazario", position: "ST", ovr: 95, price: 188, status: "Icon" },
  { name: "Zinedine Zidane", position: "CAM", ovr: 94, price: 175, status: "Icon" },
  { name: "Johan Cruyff", position: "CF", ovr: 94, price: 172, status: "Icon" },
  { name: "Ronaldinho", position: "LW", ovr: 94, price: 170, status: "Icon" },
  { name: "Lev Yashin", position: "GK", ovr: 94, price: 160, status: "Icon" },
  { name: "Thierry Henry", position: "ST", ovr: 93, price: 160, status: "Icon" },
  { name: "Paolo Maldini", position: "CB", ovr: 93, price: 150, status: "Icon" },
  { name: "Franz Beckenbauer", position: "CB", ovr: 93, price: 155, status: "Icon" },
  { name: "Ruud Gullit", position: "CM", ovr: 93, price: 160, status: "Icon" },
  { name: "Ferenc Puskas", position: "ST", ovr: 93, price: 155, status: "Icon" },
  { name: "Garrincha", position: "RW", ovr: 93, price: 154, status: "Icon" },
  { name: "Cafu", position: "RB", ovr: 92, price: 132, status: "Icon" },
  { name: "Franco Baresi", position: "CB", ovr: 92, price: 135, status: "Icon" },
  { name: "Lothar Matthaus", position: "CM", ovr: 92, price: 142, status: "Icon" },
  { name: "Eusebio", position: "ST", ovr: 92, price: 140, status: "Icon" },
  { name: "Marco van Basten", position: "ST", ovr: 92, price: 138, status: "Icon" },
  { name: "Gianluigi Buffon", position: "GK", ovr: 92, price: 125, status: "Icon" },
  { name: "Roberto Carlos", position: "LB", ovr: 91, price: 126, status: "Icon" },
  { name: "Patrick Vieira", position: "CDM", ovr: 91, price: 128, status: "Icon" },
  { name: "Xavi", position: "CM", ovr: 91, price: 124, status: "Icon" },
  { name: "Andres Iniesta", position: "CM", ovr: 91, price: 125, status: "Icon" },
  { name: "Kaka", position: "CAM", ovr: 91, price: 122, status: "Icon" },
  { name: "Iker Casillas", position: "GK", ovr: 91, price: 115, status: "Icon" },
  { name: "George Best", position: "RW", ovr: 91, price: 124, status: "Icon" },
  { name: "Andrea Pirlo", position: "CM", ovr: 90, price: 110, status: "Icon" },
  { name: "Raul", position: "ST", ovr: 90, price: 108, status: "Icon" },
  { name: "Peter Schmeichel", position: "GK", ovr: 90, price: 105, status: "Icon" },
  { name: "Alessandro Nesta", position: "CB", ovr: 90, price: 110, status: "Icon" },
  { name: "Philipp Lahm", position: "RB", ovr: 90, price: 112, status: "Icon" },
  { name: "Didier Drogba", position: "ST", ovr: 90, price: 112, status: "Icon" },
  { name: "Luis Figo", position: "RW", ovr: 90, price: 110, status: "Icon" },
  { name: "David Beckham", position: "RM", ovr: 89, price: 92, status: "Icon" },
  { name: "Clarence Seedorf", position: "CM", ovr: 89, price: 95, status: "Icon" },
];

const playerMeta = Object.freeze({
  "Kylian Mbappe": { nationality: "France", club: "Real Madrid", wikiTitle: "Kylian Mbappe" },
  "Erling Haaland": { nationality: "Norway", club: "Manchester City" },
  "Vinicius Junior": { nationality: "Brazil", club: "Real Madrid", wikiTitle: "Vinicius Junior" },
  Rodri: { nationality: "Spain", club: "Manchester City", wikiTitle: "Rodri (footballer, born 1996)" },
  "Jude Bellingham": { nationality: "England", club: "Real Madrid" },
  "Kevin De Bruyne": { nationality: "Belgium", club: "Napoli" },
  "Mohamed Salah": { nationality: "Egypt", club: "Liverpool" },
  "Harry Kane": { nationality: "England", club: "Bayern Munich" },
  "Thibaut Courtois": { nationality: "Belgium", club: "Real Madrid" },
  "Jamal Musiala": { nationality: "Germany", club: "Bayern Munich" },
  "Florian Wirtz": { nationality: "Germany", club: "Liverpool" },
  "Lautaro Martinez": { nationality: "Argentina", club: "Inter Milan" },
  "Virgil van Dijk": { nationality: "Netherlands", club: "Liverpool" },
  Alisson: { nationality: "Brazil", club: "Liverpool", wikiTitle: "Alisson Becker" },
  "Federico Valverde": { nationality: "Uruguay", club: "Real Madrid" },
  "Martin Odegaard": { nationality: "Norway", club: "Arsenal", wikiTitle: "Martin Odegaard" },
  "Bukayo Saka": { nationality: "England", club: "Arsenal" },
  "Robert Lewandowski": { nationality: "Poland", club: "Barcelona" },
  "Ruben Dias": { nationality: "Portugal", club: "Manchester City", wikiTitle: "Ruben Dias" },
  Ederson: { nationality: "Brazil", club: "Fenerbahce", wikiTitle: "Ederson (footballer, born 1993)" },
  "Marc-Andre ter Stegen": { nationality: "Germany", club: "Barcelona", wikiTitle: "Marc-Andre ter Stegen" },
  "Phil Foden": { nationality: "England", club: "Manchester City" },
  Pedri: { nationality: "Spain", club: "Barcelona" },
  "Nicolo Barella": { nationality: "Italy", club: "Inter Milan", wikiTitle: "Nicolo Barella" },
  "Joshua Kimmich": { nationality: "Germany", club: "Bayern Munich" },
  "Bruno Fernandes": { nationality: "Portugal", club: "Manchester United" },
  "Bernardo Silva": { nationality: "Portugal", club: "Manchester City" },
  "Heung Min Son": { nationality: "South Korea", club: "LAFC", wikiTitle: "Son Heung-min" },
  "Antoine Griezmann": { nationality: "France", club: "Atletico Madrid" },
  "Victor Osimhen": { nationality: "Nigeria", club: "Galatasaray" },
  "Neymar Jr": { nationality: "Brazil", club: "Santos", wikiTitle: "Neymar" },
  "Lionel Messi": { nationality: "Argentina", club: "Inter Miami" },
  "Gianluigi Donnarumma": { nationality: "Italy", club: "Manchester City" },
  "Mike Maignan": { nationality: "France", club: "AC Milan" },
  "Jan Oblak": { nationality: "Slovenia", club: "Atletico Madrid" },
  "William Saliba": { nationality: "France", club: "Arsenal" },
  "Frenkie de Jong": { nationality: "Netherlands", club: "Barcelona" },
  "Aurelien Tchouameni": { nationality: "France", club: "Real Madrid", wikiTitle: "Aurelien Tchouameni" },
  "Declan Rice": { nationality: "England", club: "Arsenal" },
  "Luka Modric": { nationality: "Croatia", club: "AC Milan", wikiTitle: "Luka Modric" },
  "Rafael Leao": { nationality: "Portugal", club: "AC Milan", wikiTitle: "Rafael Leao" },
  Rodrygo: { nationality: "Brazil", club: "Real Madrid", wikiTitle: "Rodrygo (footballer, born 2001)" },
  "Khvicha Kvaratskhelia": { nationality: "Georgia", club: "Paris Saint-Germain" },
  "Cole Palmer": { nationality: "England", club: "Chelsea" },
  "Viktor Gyokeres": { nationality: "Sweden", club: "Arsenal", wikiTitle: "Viktor Gyokeres" },
  "Lamine Yamal": { nationality: "Spain", club: "Barcelona" },
  "Ronald Araujo": { nationality: "Uruguay", club: "Barcelona", wikiTitle: "Ronald Araujo" },
  "Alessandro Bastoni": { nationality: "Italy", club: "Inter Milan" },
  "Antonio Rudiger": { nationality: "Germany", club: "Real Madrid", wikiTitle: "Antonio Rudiger" },
  "Trent Alexander-Arnold": { nationality: "England", club: "Real Madrid" },
  "Theo Hernandez": { nationality: "France", club: "Al Hilal", wikiTitle: "Theo Hernandez" },
  "Gregor Kobel": { nationality: "Switzerland", club: "Borussia Dortmund" },
  "Eduardo Camavinga": { nationality: "France", club: "Real Madrid" },
  "Alexis Mac Allister": { nationality: "Argentina", club: "Liverpool" },
  Vitinha: { nationality: "Portugal", club: "Paris Saint-Germain", wikiTitle: "Vitinha (footballer, born February 2000)" },
  "Hakan Calhanoglu": { nationality: "Turkey", club: "Inter Milan", wikiTitle: "Hakan Calhanoglu" },
  "Julian Alvarez": { nationality: "Argentina", club: "Atletico Madrid", wikiTitle: "Julian Alvarez" },
  "Alexander Isak": { nationality: "Sweden", club: "Liverpool" },
  "Luis Diaz": { nationality: "Colombia", club: "Bayern Munich", wikiTitle: "Luis Diaz" },
  "Ousmane Dembele": { nationality: "France", club: "Paris Saint-Germain", wikiTitle: "Ousmane Dembele" },
  Raphinha: { nationality: "Brazil", club: "Barcelona" },
  "Nico Williams": { nationality: "Spain", club: "Athletic Club" },
  "Cristiano Ronaldo": { nationality: "Portugal", club: "Al Nassr" },
  "Paulo Dybala": { nationality: "Argentina", club: "Roma" },
  "Dusan Vlahovic": { nationality: "Serbia", club: "Juventus", wikiTitle: "Dusan Vlahovic" },
  Marquinhos: { nationality: "Brazil", club: "Paris Saint-Germain", wikiTitle: "Marquinhos" },
  "Josko Gvardiol": { nationality: "Croatia", club: "Manchester City", wikiTitle: "Josko Gvardiol" },
  "Achraf Hakimi": { nationality: "Morocco", club: "Paris Saint-Germain" },
  "Matthijs de Ligt": { nationality: "Netherlands", club: "Manchester United" },
  "Eder Militao": { nationality: "Brazil", club: "Real Madrid", wikiTitle: "Eder Militao" },
  Gabriel: { nationality: "Brazil", club: "Arsenal", wikiTitle: "Gabriel Magalhaes" },
  "Ilkay Gundogan": { nationality: "Germany", club: "Galatasaray", wikiTitle: "Ilkay Gundogan" },
  "Dominik Szoboszlai": { nationality: "Hungary", club: "Liverpool" },
  Gavi: { nationality: "Spain", club: "Barcelona", wikiTitle: "Gavi (footballer)" },
  "Martin Zubimendi": { nationality: "Spain", club: "Arsenal" },
  "Sandro Tonali": { nationality: "Italy", club: "Newcastle United" },
  "Xavi Simons": { nationality: "Netherlands", club: "Tottenham Hotspur" },
  "Ollie Watkins": { nationality: "England", club: "Aston Villa" },
  "Lois Openda": { nationality: "Belgium", club: "Juventus", wikiTitle: "Lois Openda" },
  "Kai Havertz": { nationality: "Germany", club: "Arsenal" },
  "Yann Sommer": { nationality: "Switzerland", club: "Inter Milan" },
  "Diogo Costa": { nationality: "Portugal", club: "Porto" },
  "Kyle Walker": { nationality: "England", club: "Burnley" },
  "Dani Carvajal": { nationality: "Spain", club: "Real Madrid" },
  "Alejandro Grimaldo": { nationality: "Spain", club: "Bayer Leverkusen" },
  "Federico Dimarco": { nationality: "Italy", club: "Inter Milan" },
  "John Stones": { nationality: "England", club: "Manchester City" },
  "Enzo Fernandez": { nationality: "Argentina", club: "Chelsea", wikiTitle: "Enzo Fernandez" },
  "Joao Cancelo": { nationality: "Portugal", club: "Al Hilal", wikiTitle: "Joao Cancelo" },
  "James Maddison": { nationality: "England", club: "Tottenham Hotspur" },
  "Joao Palhinha": { nationality: "Portugal", club: "Tottenham Hotspur", wikiTitle: "Joao Palhinha" },
  "Marcus Rashford": { nationality: "England", club: "Barcelona" },
  "Federico Chiesa": { nationality: "Italy", club: "Liverpool" },
  "Victor Boniface": { nationality: "Nigeria", club: "Bayer Leverkusen" },
  "Jeremy Doku": { nationality: "Belgium", club: "Manchester City" },
  "Unai Simon": { nationality: "Spain", club: "Athletic Club", wikiTitle: "Unai Simon" },
  "Reece James": { nationality: "England", club: "Chelsea" },
  "Andrew Robertson": { nationality: "Scotland", club: "Liverpool" },
  "Dayot Upamecano": { nationality: "France", club: "Bayern Munich" },
  "Lisandro Martinez": { nationality: "Argentina", club: "Manchester United", wikiTitle: "Lisandro Martinez" },
  "Karim Adeyemi": { nationality: "Germany", club: "Borussia Dortmund" },
  "Alejandro Garnacho": { nationality: "Argentina", club: "Chelsea" },
  Pele: { nationality: "Brazil", club: "Santos", wikiTitle: "Pele" },
  "Diego Maradona": { nationality: "Argentina", club: "Napoli", wikiTitle: "Diego Maradona" },
  "Ronaldo Nazario": { nationality: "Brazil", club: "Real Madrid", wikiTitle: "Ronaldo (Brazilian footballer)" },
  "Zinedine Zidane": { nationality: "France", club: "Real Madrid" },
  "Johan Cruyff": { nationality: "Netherlands", club: "Ajax" },
  Ronaldinho: { nationality: "Brazil", club: "Barcelona" },
  "Lev Yashin": { nationality: "Soviet Union", club: "Dynamo Moscow" },
  "Thierry Henry": { nationality: "France", club: "Arsenal" },
  "Paolo Maldini": { nationality: "Italy", club: "AC Milan" },
  "Franz Beckenbauer": { nationality: "Germany", club: "Bayern Munich" },
  "Ruud Gullit": { nationality: "Netherlands", club: "AC Milan" },
  "Ferenc Puskas": { nationality: "Hungary", club: "Real Madrid", wikiTitle: "Ferenc Puskas" },
  Garrincha: { nationality: "Brazil", club: "Botafogo" },
  Cafu: { nationality: "Brazil", club: "AC Milan" },
  "Franco Baresi": { nationality: "Italy", club: "AC Milan" },
  "Lothar Matthaus": { nationality: "Germany", club: "Bayern Munich", wikiTitle: "Lothar Matthaus" },
  Eusebio: { nationality: "Portugal", club: "Benfica", wikiTitle: "Eusebio" },
  "Marco van Basten": { nationality: "Netherlands", club: "AC Milan" },
  "Gianluigi Buffon": { nationality: "Italy", club: "Juventus" },
  "Roberto Carlos": { nationality: "Brazil", club: "Real Madrid" },
  "Patrick Vieira": { nationality: "France", club: "Arsenal" },
  Xavi: { nationality: "Spain", club: "Barcelona" },
  "Andres Iniesta": { nationality: "Spain", club: "Barcelona", wikiTitle: "Andres Iniesta" },
  Kaka: { nationality: "Brazil", club: "AC Milan", wikiTitle: "Kaka" },
  "Iker Casillas": { nationality: "Spain", club: "Real Madrid" },
  "George Best": { nationality: "Northern Ireland", club: "Manchester United" },
  "Andrea Pirlo": { nationality: "Italy", club: "AC Milan" },
  Raul: { nationality: "Spain", club: "Real Madrid", wikiTitle: "Raul (footballer)" },
  "Peter Schmeichel": { nationality: "Denmark", club: "Manchester United" },
  "Alessandro Nesta": { nationality: "Italy", club: "AC Milan" },
  "Philipp Lahm": { nationality: "Germany", club: "Bayern Munich" },
  "Didier Drogba": { nationality: "Ivory Coast", club: "Chelsea" },
  "Luis Figo": { nationality: "Portugal", club: "Real Madrid" },
  "David Beckham": { nationality: "England", club: "Manchester United" },
  "Clarence Seedorf": { nationality: "Netherlands", club: "AC Milan" },
});

const playerDatabase = rawPlayers
  .map((player, index) => ({
    nationality: "Unknown",
    club: player.status === "Icon" ? "Icon XI" : "Free Agent",
    wikiTitle: player.name,
    ...player,
    ...(playerMeta[player.name] || {}),
    id: `${slugify(player.name)}-${index}`,
  }))
  .sort((a, b) => b.ovr - a.ovr || a.price - b.price || a.name.localeCompare(b.name));

const managers = [
  { id: "pep-guardiola", name: "Pep Guardiola", style: "Positional play", price: 100, boost: 5, accent: "rgba(52, 208, 195, 0.28)" },
  { id: "jurgen-klopp", name: "Jurgen Klopp", style: "Gegenpress", price: 92, boost: 5, accent: "rgba(242, 99, 99, 0.28)" },
  { id: "carlo-ancelotti", name: "Carlo Ancelotti", style: "Elite control", price: 95, boost: 5, accent: "rgba(241, 199, 91, 0.3)" },
  { id: "xabi-alonso", name: "Xabi Alonso", style: "Hybrid buildup", price: 82, boost: 4, accent: "rgba(46, 212, 122, 0.28)" },
  { id: "luis-enrique", name: "Luis Enrique", style: "High tempo", price: 78, boost: 4, accent: "rgba(92, 142, 255, 0.26)" },
  { id: "diego-simeone", name: "Diego Simeone", style: "Compact block", price: 75, boost: 4, accent: "rgba(242, 99, 99, 0.22)" },
  { id: "mikel-arteta", name: "Mikel Arteta", style: "Structured press", price: 72, boost: 3, accent: "rgba(241, 199, 91, 0.22)" },
  { id: "simone-inzaghi", name: "Simone Inzaghi", style: "Back-three flow", price: 70, boost: 3, accent: "rgba(52, 208, 195, 0.22)" },
  { id: "zinedine-zidane", name: "Zinedine Zidane", style: "Big-match aura", price: 90, boost: 5, accent: "rgba(255, 255, 255, 0.22)" },
  { id: "thomas-tuchel", name: "Thomas Tuchel", style: "Adaptive systems", price: 68, boost: 3, accent: "rgba(92, 142, 255, 0.2)" },
];

const formations = {
  "4-3-3": [
    slot("GK", "GK", 50, 91),
    slot("LB", "LB", 18, 74),
    slot("LCB", "CB", 38, 75),
    slot("RCB", "CB", 62, 75),
    slot("RB", "RB", 82, 74),
    slot("LCM", "CM", 30, 52),
    slot("CM", "CM", 50, 47),
    slot("RCM", "CM", 70, 52),
    slot("LW", "LW", 18, 25),
    slot("ST", "ST", 50, 18),
    slot("RW", "RW", 82, 25),
  ],
  "4-2-3-1": [
    slot("GK", "GK", 50, 91),
    slot("LB", "LB", 18, 74),
    slot("LCB", "CB", 38, 75),
    slot("RCB", "CB", 62, 75),
    slot("RB", "RB", 82, 74),
    slot("LDM", "CDM", 38, 55),
    slot("RDM", "CDM", 62, 55),
    slot("LAM", "CAM", 26, 34),
    slot("CAM", "CAM", 50, 31),
    slot("RAM", "CAM", 74, 34),
    slot("ST", "ST", 50, 16),
  ],
  "3-5-2": [
    slot("GK", "GK", 50, 91),
    slot("LCB", "CB", 28, 75),
    slot("CB", "CB", 50, 78),
    slot("RCB", "CB", 72, 75),
    slot("LM", "LM", 15, 51),
    slot("LCM", "CM", 36, 50),
    slot("CM", "CM", 50, 43),
    slot("RCM", "CM", 64, 50),
    slot("RM", "RM", 85, 51),
    slot("LST", "ST", 40, 18),
    slot("RST", "ST", 60, 18),
  ],
  "4-4-2": [
    slot("GK", "GK", 50, 91),
    slot("LB", "LB", 18, 74),
    slot("LCB", "CB", 38, 75),
    slot("RCB", "CB", 62, 75),
    slot("RB", "RB", 82, 74),
    slot("LM", "LM", 18, 48),
    slot("LCM", "CM", 40, 49),
    slot("RCM", "CM", 60, 49),
    slot("RM", "RM", 82, 48),
    slot("LST", "ST", 40, 18),
    slot("RST", "ST", 60, 18),
  ],
  "5-3-2": [
    slot("GK", "GK", 50, 91),
    slot("LWB", "LWB", 14, 68),
    slot("LCB", "CB", 32, 75),
    slot("CB", "CB", 50, 78),
    slot("RCB", "CB", 68, 75),
    slot("RWB", "RWB", 86, 68),
    slot("LCM", "CM", 34, 47),
    slot("CM", "CM", 50, 42),
    slot("RCM", "CM", 66, 47),
    slot("LST", "ST", 40, 18),
    slot("RST", "ST", 60, 18),
  ],
  "4-1-2-1-2": [
    slot("GK", "GK", 50, 91),
    slot("LB", "LB", 18, 74),
    slot("LCB", "CB", 38, 75),
    slot("RCB", "CB", 62, 75),
    slot("RB", "RB", 82, 74),
    slot("CDM", "CDM", 50, 59),
    slot("LCM", "CM", 34, 45),
    slot("RCM", "CM", 66, 45),
    slot("CAM", "CAM", 50, 31),
    slot("LST", "ST", 40, 16),
    slot("RST", "ST", 60, 16),
  ],
};

const compatibility = {
  GK: ["GK"],
  CB: ["CB", "LB", "RB", "CDM"],
  LB: ["LB", "LWB", "CB", "RB"],
  RB: ["RB", "RWB", "CB", "LB"],
  LWB: ["LWB", "LB", "LM", "LW"],
  RWB: ["RWB", "RB", "RM", "RW"],
  CDM: ["CDM", "CM", "CB"],
  CM: ["CM", "CDM", "CAM", "LM", "RM"],
  CAM: ["CAM", "CM", "CF", "LW", "RW"],
  LM: ["LM", "LW", "LWB", "CM"],
  RM: ["RM", "RW", "RWB", "CM"],
  LW: ["LW", "LM", "ST", "CF"],
  RW: ["RW", "RM", "ST", "CF"],
  ST: ["ST", "CF", "LW", "RW"],
  CF: ["CF", "ST", "CAM"],
};

const playerById = new Map(playerDatabase.map((player) => [player.id, player]));
const managerById = new Map(managers.map((manager) => [manager.id, manager]));
const avatarCache = new Map();
const photoCache = new Map();

let state = loadState();
let toastTimer = null;

const els = {};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();
  initAuthControls();
  initMultiplayerControls();
  populateFormationSelect();
  populatePositionFilter();
  attachEvents();
  normalizeStateForFormation();
  els.formationSelect.value = state.formation;
  render();
  checkAuthSession();
  autoJoinRoomFromUrl();
}

function cacheElements() {
  els.budgetValue = document.getElementById("budgetValue");
  els.teamOvrValue = document.getElementById("teamOvrValue");
  els.lineupCountValue = document.getElementById("lineupCountValue");
  els.playerCount = document.getElementById("playerCount");
  els.searchInput = document.getElementById("searchInput");
  els.positionFilter = document.getElementById("positionFilter");
  els.statusFilter = document.getElementById("statusFilter");
  els.playerGrid = document.getElementById("playerGrid");
  els.formationSelect = document.getElementById("formationSelect");
  els.clearLineupButton = document.getElementById("clearLineupButton");
  els.pitch = document.getElementById("pitch");
  els.managerGrid = document.getElementById("managerGrid");
  els.managerStatus = document.getElementById("managerStatus");
  els.baseRatingValue = document.getElementById("baseRatingValue");
  els.simulateButton = document.getElementById("simulateButton");
  els.reviewContent = document.getElementById("reviewContent");
  els.scoreBadge = document.getElementById("scoreBadge");
  els.toast = document.getElementById("toast");
  els.roomInput = document.getElementById("roomInput");
  els.joinRoomButton = document.getElementById("joinRoomButton");
  els.copyRoomButton = document.getElementById("copyRoomButton");
  els.roomStatus = document.getElementById("roomStatus");
  els.usernameInput = document.getElementById("usernameInput");
  els.passwordInput = document.getElementById("passwordInput");
  els.loginButton = document.getElementById("loginButton");
  els.registerButton = document.getElementById("registerButton");
  els.logoutButton = document.getElementById("logoutButton");
  els.authStatus = document.getElementById("authStatus");
}

function populateFormationSelect() {
  els.formationSelect.innerHTML = Object.keys(formations)
    .map((name) => `<option value="${name}">${name}</option>`)
    .join("");
  els.formationSelect.value = state.formation;
}

function populatePositionFilter() {
  const positions = [...new Set(playerDatabase.map((player) => player.position))].sort(sortPositions);
  els.positionFilter.insertAdjacentHTML(
    "beforeend",
    positions.map((position) => `<option value="${position}">${position}</option>`).join(""),
  );
  els.searchInput.value = state.search;
  els.positionFilter.value = state.positionFilter;
  els.statusFilter.value = state.statusFilter;
}

function attachEvents() {
  els.searchInput.addEventListener("input", (event) => {
    state.search = event.target.value;
    state.review = null;
    renderPlayers();
    saveState();
  });

  els.positionFilter.addEventListener("change", (event) => {
    state.positionFilter = event.target.value;
    renderPlayers();
    saveState();
  });

  els.statusFilter.addEventListener("change", (event) => {
    state.statusFilter = event.target.value;
    renderPlayers();
    saveState();
  });

  els.formationSelect.addEventListener("change", (event) => {
    changeFormation(event.target.value);
  });

  els.clearLineupButton.addEventListener("click", () => {
    state.lineup = {};
    state.selectedSlotId = null;
    state.review = null;
    showToast("Lineup cleared. Budget refunded.");
    render({ broadcast: true });
  });

  els.simulateButton.addEventListener("click", () => {
    const validation = validateSimulationReady();
    if (!validation.ready) {
      showToast(validation.message);
      return;
    }
    state.review = simulateSeason();
    showToast("Season simulated.");
    render({ broadcast: true });
  });

  els.joinRoomButton.addEventListener("click", () => {
    connectToRoom(els.roomInput.value);
  });

  els.roomInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      connectToRoom(els.roomInput.value);
    }
  });

  els.roomInput.addEventListener("input", () => {
    els.roomInput.value = normalizeRoomId(els.roomInput.value);
  });

  els.copyRoomButton.addEventListener("click", copyRoomLink);

  els.loginButton.addEventListener("click", () => {
    submitAuth("login");
  });

  els.registerButton.addEventListener("click", () => {
    submitAuth("register");
  });

  els.logoutButton.addEventListener("click", logout);

  els.passwordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      submitAuth("login");
    }
  });
}

function render(options = {}) {
  recalculateBudget();
  renderMetrics();
  renderPitch();
  renderPlayers();
  renderManagers();
  renderSimulationPanel();
  renderReview();
  saveState();
  scheduleProgressSave();
  if (options.broadcast) {
    broadcastSharedState();
  }
}

function renderMetrics() {
  const lineupPlayers = getLineupPlayers();
  const baseRating = calculateBaseRating(lineupPlayers);

  els.budgetValue.textContent = formatMoney(currentBudget);
  els.teamOvrValue.textContent = lineupPlayers.length ? baseRating.toFixed(1) : "--";
  els.lineupCountValue.textContent = `${lineupPlayers.length}/11`;
}

function renderPitch() {
  const slots = getCurrentSlots();
  els.pitch.innerHTML = "";

  slots.forEach((slotData) => {
    const slotEl = document.createElement("button");
    slotEl.className = "formation-slot";
    slotEl.type = "button";
    slotEl.style.left = `${slotData.x}%`;
    slotEl.style.top = `${slotData.y}%`;
    slotEl.dataset.slotId = slotData.id;
    slotEl.title = slotData.label;
    slotEl.setAttribute("aria-label", `${slotData.label} slot`);

    if (state.selectedSlotId === slotData.id) {
      slotEl.classList.add("active");
    }

    slotEl.addEventListener("click", () => {
      state.selectedSlotId = state.selectedSlotId === slotData.id ? null : slotData.id;
      renderPitch();
      saveState();
    });

    slotEl.addEventListener("dragover", (event) => {
      event.preventDefault();
      slotEl.classList.add("drop-ready");
    });

    slotEl.addEventListener("dragleave", () => {
      slotEl.classList.remove("drop-ready");
    });

    slotEl.addEventListener("drop", (event) => {
      event.preventDefault();
      slotEl.classList.remove("drop-ready");
      const playerId = event.dataTransfer.getData("text/plain");
      assignPlayerToSlot(playerId, slotData.id);
    });

    const playerId = state.lineup[slotData.id];
    const player = playerById.get(playerId);

    if (player) {
      slotEl.innerHTML = renderSlotPlayer(player, slotData);
      attachImageFallbacks(slotEl, player);
      const sellButton = slotEl.querySelector(".slot-sell");
      sellButton.addEventListener("click", (event) => {
        event.stopPropagation();
        removePlayerFromSlot(slotData.id);
      });
    } else {
      slotEl.innerHTML = `
        <span class="empty-slot">
          <span class="slot-role">${slotData.label}</span>
          <span>${slotData.position}</span>
        </span>
      `;
    }

    els.pitch.appendChild(slotEl);
  });

  hydrateVisiblePlayerImages(getLineupPlayers());
}

function renderSlotPlayer(player, slotData) {
  return `
    <span class="slot-player ${cardTier(player)}">
      <span class="slot-top">
        <span>${player.ovr}</span>
        <span>${slotData.label}</span>
      </span>
      <img src="${getInitialPlayerImage(player)}" alt="${escapeHtml(player.name)} portrait" data-player-image="${player.id}" draggable="false" />
      <span class="slot-name">${escapeHtml(lastName(player.name))}</span>
      <span class="slot-detail">${escapeHtml(player.nationality)}</span>
      <span class="slot-sell" role="button" aria-label="Sell ${escapeHtml(player.name)}" title="Sell">x</span>
    </span>
  `;
}

function renderPlayers() {
  recalculateBudget();
  const players = getFilteredPlayers();
  const selectedPlayerIds = new Set(Object.values(state.lineup));

  els.playerCount.textContent = players.length;
  els.playerGrid.innerHTML = "";

  const fragment = document.createDocumentFragment();

  players.forEach((player) => {
    const isSelected = selectedPlayerIds.has(player.id);
    const cannotAfford = !isSelected && player.price > currentBudget;
    const card = document.createElement("article");
    card.className = `player-card ${cardTier(player)}${isSelected ? " selected" : ""}${cannotAfford ? " disabled" : ""}`;
    card.draggable = true;
    card.tabIndex = 0;
    card.title = `${player.name} - ${player.position} - ${player.nationality} - ${player.club} - ${formatMoney(player.price)}`;
    card.innerHTML = `
      <span class="card-shine"></span>
      <div class="card-meta">
        <strong>${player.ovr}</strong>
        <span>${player.position}</span>
      </div>
      <span class="card-price">${formatMoney(player.price)}</span>
      <div class="player-photo">
        <img src="${getInitialPlayerImage(player)}" alt="${escapeHtml(player.name)} portrait" data-player-image="${player.id}" loading="lazy" draggable="false" />
      </div>
      <div class="name-banner">
        <strong>${escapeHtml(player.name)}</strong>
        <span class="card-subline">
          <span>${escapeHtml(player.status)}</span>
          <span>${escapeHtml(player.nationality)}</span>
        </span>
        <span class="card-club">${escapeHtml(player.club)}</span>
      </div>
    `;
    attachImageFallbacks(card, player);

    card.addEventListener("click", () => autoAssignPlayer(player.id));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        autoAssignPlayer(player.id);
      }
    });
    card.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", player.id);
    });

    fragment.appendChild(card);
  });

  els.playerGrid.appendChild(fragment);
  hydrateVisiblePlayerImages(players);
}

function renderManagers() {
  recalculateBudget();
  els.managerGrid.innerHTML = "";
  const selectedManager = managerById.get(state.selectedManagerId);
  const managerRefund = selectedManager ? selectedManager.price : 0;

  managers.forEach((manager) => {
    const selected = state.selectedManagerId === manager.id;
    const affordable = selected || manager.price <= currentBudget + managerRefund;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `manager-card${selected ? " selected" : ""}`;
    button.style.setProperty("--manager-accent", manager.accent);
    button.disabled = !affordable;
    button.title = `${manager.name} - ${formatMoney(manager.price)}`;
    button.innerHTML = `
      <span class="manager-badge">${initials(manager.name)}</span>
      <span>
        <h3>${escapeHtml(manager.name)}</h3>
        <p>${escapeHtml(manager.style)}${selected ? " - Selected" : ""}</p>
      </span>
      <span class="manager-price">${formatMoney(manager.price)}</span>
    `;
    button.addEventListener("click", () => selectManager(manager.id));
    els.managerGrid.appendChild(button);
  });
}

function renderSimulationPanel() {
  const lineupPlayers = getLineupPlayers();
  const baseRating = calculateBaseRating(lineupPlayers);
  const manager = managerById.get(state.selectedManagerId);
  const validation = validateSimulationReady();

  els.managerStatus.textContent = manager ? manager.name : "Required";
  els.baseRatingValue.textContent = lineupPlayers.length ? baseRating.toFixed(1) : "--";
  els.simulateButton.disabled = !validation.ready;
}

function renderReview() {
  const review = state.review;

  if (!review) {
    els.scoreBadge.textContent = "0 pts";
    els.reviewContent.innerHTML = `<div class="review-empty">No season simulated yet.</div>`;
    return;
  }

  els.scoreBadge.textContent = `${review.score} pts`;
  els.reviewContent.innerHTML = `
    <div class="review-grid">
      <div class="review-tile">
        <span>League</span>
        <strong>${review.league.champion ? "Champion" : `P${review.league.position}`}</strong>
        <p>${review.league.points} pts - ${review.league.record.w}W ${review.league.record.d}D ${review.league.record.l}L</p>
      </div>
      <div class="review-tile">
        <span>UCL</span>
        <strong>${review.ucl.champion ? "Champion" : review.ucl.exitRound}</strong>
        <p>${review.ucl.champion ? "+15 points" : "Knockout exit"}</p>
      </div>
      <div class="review-tile">
        <span>Domestic Cups</span>
        <strong>${review.cups.filter((cup) => cup.champion).length}/2</strong>
        <p>${review.cups.map((cup) => `${cup.name}: ${cup.champion ? "Won" : cup.exitRound}`).join(" | ")}</p>
      </div>
      <div class="review-tile">
        <span>Awards</span>
        <strong>${review.awards.filter((award) => award.won).length}</strong>
        <p>${review.awards.filter((award) => award.won).map((award) => award.name).join(" | ") || "None"}</p>
      </div>
    </div>
    <div class="review-details">
      ${renderBracket("UCL Path", review.ucl.rounds)}
      ${renderBracket("Cup Runs", review.cups.flatMap((cup) => cup.rounds.map((round) => ({ ...round, round: `${cup.name} ${round.round}` }))))}
    </div>
    <div class="review-details">
      ${renderAwards(review.awards)}
      <div class="bracket-list">
        <span>Squad Rating</span>
        <ul>
          <li><span>Base XI</span><strong>${review.baseRating.toFixed(1)}</strong></li>
          <li><span>Tactical Boost</span><strong>Applied</strong></li>
          <li><span>Manager</span><strong>${escapeHtml(review.managerName)}</strong></li>
        </ul>
      </div>
    </div>
  `;
}

function renderBracket(title, rounds) {
  return `
    <div class="bracket-list">
      <span>${title}</span>
      <ul>
        ${rounds
          .map(
            (round) => `
              <li>
                <span>${escapeHtml(round.round)} vs ${escapeHtml(round.opponent)}</span>
                <strong class="${round.won ? "result-win" : "result-loss"}">${round.scoreline}</strong>
              </li>
            `,
          )
          .join("")}
      </ul>
    </div>
  `;
}

function renderAwards(awards) {
  return `
    <div class="awards-list">
      <span>Individual Awards</span>
      <ul>
        ${awards
          .map(
            (award) => `
              <li>
                <span>${award.name}</span>
                <strong class="${award.won ? "result-win" : "result-loss"}">${award.won ? escapeHtml(award.player.name) : "No winner"}</strong>
              </li>
            `,
          )
          .join("")}
      </ul>
    </div>
  `;
}

function changeFormation(name) {
  const existingPlayers = getLineupPlayers().map((player) => player.id);
  state.formation = name;
  state.selectedSlotId = null;
  state.review = null;
  state.lineup = {};

  existingPlayers.forEach((playerId) => {
    const targetSlot = findFirstCompatibleSlot(playerId, true);
    if (targetSlot) {
      state.lineup[targetSlot.id] = playerId;
    }
  });

  showToast(`${name} loaded.`);
  render({ broadcast: true });
}

function autoAssignPlayer(playerId) {
  if (!playerById.has(playerId)) return;

  const selectedSlot = getCurrentSlots().find((slotData) => slotData.id === state.selectedSlotId);
  if (selectedSlot) {
    assignPlayerToSlot(playerId, selectedSlot.id);
    return;
  }

  const targetSlot = findFirstCompatibleSlot(playerId, true);
  if (!targetSlot) {
    const existingSlot = findPlayerSlot(playerId);
    if (existingSlot) {
      showToast("That player is already in the XI.");
    } else {
      showToast("No open compatible slot in this formation.");
    }
    return;
  }

  assignPlayerToSlot(playerId, targetSlot.id);
}

function assignPlayerToSlot(playerId, slotId) {
  const player = playerById.get(playerId);
  const slotData = getCurrentSlots().find((slotItem) => slotItem.id === slotId);

  if (!player || !slotData) return;

  if (!canPlaySlot(player, slotData)) {
    showToast(`${player.position} cannot play ${slotData.label}.`);
    return;
  }

  recalculateBudget();
  const existingSlotId = findPlayerSlot(playerId);
  const currentPlayerId = state.lineup[slotId];
  const currentPlayer = playerById.get(currentPlayerId);
  const availableBudget = currentBudget + (currentPlayer ? currentPlayer.price : 0);

  if (!existingSlotId && player.price > availableBudget) {
    showToast(`${player.name} costs ${formatMoney(player.price)}. Budget left: ${formatMoney(currentBudget)}.`);
    return;
  }

  if (existingSlotId && existingSlotId !== slotId) {
    delete state.lineup[existingSlotId];
  }

  state.lineup[slotId] = playerId;
  state.selectedSlotId = slotId;
  state.review = null;
  showToast(`${player.name} added to ${slotData.label}.`);
  render({ broadcast: true });
}

function removePlayerFromSlot(slotId) {
  const player = playerById.get(state.lineup[slotId]);
  delete state.lineup[slotId];
  state.review = null;
  if (state.selectedSlotId === slotId) {
    state.selectedSlotId = null;
  }
  showToast(`${player ? player.name : "Player"} sold. Budget refunded.`);
  render({ broadcast: true });
}

function selectManager(managerId) {
  const manager = managerById.get(managerId);
  if (!manager) return;

  recalculateBudget();
  const selectedManager = managerById.get(state.selectedManagerId);
  const availableBudget = currentBudget + (selectedManager ? selectedManager.price : 0);

  if (state.selectedManagerId === managerId) {
    state.selectedManagerId = null;
    state.review = null;
    showToast(`${manager.name} released. Budget refunded.`);
    render({ broadcast: true });
    return;
  }

  if (manager.price > availableBudget) {
    showToast(`${manager.name} costs ${formatMoney(manager.price)}. Budget left: ${formatMoney(currentBudget)}.`);
    return;
  }

  state.selectedManagerId = managerId;
  state.review = null;
  showToast(`${manager.name} hired.`);
  render({ broadcast: true });
}

function validateSimulationReady() {
  const lineupPlayers = getLineupPlayers();
  if (lineupPlayers.length < 11) {
    return { ready: false, message: "Complete the XI before simulating." };
  }
  if (!state.selectedManagerId) {
    return { ready: false, message: "Hire a manager before simulating." };
  }
  return { ready: true, message: "Ready" };
}

function simulateSeason() {
  const lineupPlayers = getLineupPlayers();
  const manager = managerById.get(state.selectedManagerId);
  const baseRating = calculateBaseRating(lineupPlayers);
  const teamRating = baseRating + manager.boost;
  const league = simulateLeague(teamRating);
  const ucl = simulateKnockout("UCL", teamRating, [
    { round: "Round of 16", min: 87, max: 90 },
    { round: "Quarterfinal", min: 88, max: 91 },
    { round: "Semifinal", min: 89, max: 93 },
    { round: "Final", min: 90, max: 94 },
  ]);
  const cups = [
    simulateKnockout("FA Cup", teamRating, [
      { round: "Round of 16", min: 80, max: 86 },
      { round: "Quarterfinal", min: 82, max: 88 },
      { round: "Semifinal", min: 84, max: 89 },
      { round: "Final", min: 85, max: 91 },
    ]),
    simulateKnockout("League Cup", teamRating, [
      { round: "Round of 16", min: 79, max: 85 },
      { round: "Quarterfinal", min: 81, max: 87 },
      { round: "Semifinal", min: 83, max: 89 },
      { round: "Final", min: 84, max: 90 },
    ]),
  ];
  const awards = simulateAwards(lineupPlayers, teamRating);

  let score = 0;
  if (ucl.champion) score += 15;
  if (league.champion) score += 10;
  score += cups.filter((cup) => cup.champion).length * 5;
  score += awards.filter((award) => award.won).length;

  return {
    createdAt: new Date().toISOString(),
    baseRating,
    teamRating,
    managerName: manager.name,
    league,
    ucl,
    cups,
    awards,
    score,
  };
}

function simulateLeague(teamRating) {
  let points = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  const record = { w: 0, d: 0, l: 0 };

  for (let game = 0; game < SIM_CONFIG.leagueGames; game += 1) {
    const opponentRating = clamp(78, 91, normalLike(SIM_CONFIG.leagueAverage, 3.5));
    const result = simulateMatch(teamRating, opponentRating, "league");
    goalsFor += result.forGoals;
    goalsAgainst += result.againstGoals;

    if (result.outcome === "W") {
      record.w += 1;
      points += 3;
    } else if (result.outcome === "D") {
      record.d += 1;
      points += 1;
    } else {
      record.l += 1;
    }
  }

  const eliteRivalPoints = Math.round(clamp(76, 96, normalLike(84, 5) + Math.max(0, 89 - teamRating) * 1.15));
  const champion = points >= eliteRivalPoints;
  const position = champion ? 1 : estimateLeaguePosition(points, eliteRivalPoints);

  return {
    points,
    record,
    goalsFor,
    goalsAgainst,
    champion,
    position,
    rivalPoints: eliteRivalPoints,
  };
}

function simulateKnockout(name, teamRating, roundConfig) {
  const rounds = [];
  let champion = true;
  let exitRound = "Champion";

  for (const config of roundConfig) {
    const opponentRating = randomBetween(config.min, config.max);
    const opponent = pickOpponent(name, config.round, opponentRating);
    const result = simulateMatch(teamRating, opponentRating, "knockout");
    rounds.push({
      round: config.round,
      opponent,
      opponentRating,
      won: result.outcome !== "L",
      scoreline: `${result.forGoals}-${result.againstGoals}`,
    });

    if (result.outcome === "L") {
      champion = false;
      exitRound = config.round;
      break;
    }
  }

  return { name, champion, exitRound, rounds };
}

function simulateAwards(lineupPlayers, teamRating) {
  const attackingPositions = new Set(["ST", "CF", "LW", "RW", "CAM", "LM", "RM"]);
  const attackers = lineupPlayers.filter((player) => attackingPositions.has(player.position));
  const goldenBootCandidate = weightedChoice(attackers.length ? attackers : lineupPlayers);
  const mvpCandidate = weightedChoice(lineupPlayers);
  const bootChance = clamp(0.18, 0.78, 0.28 + (teamRating - 85) * 0.045 + (goldenBootCandidate.ovr - 86) * 0.025);
  const mvpChance = clamp(0.16, 0.74, 0.24 + (teamRating - 85) * 0.04 + (mvpCandidate.ovr - 86) * 0.025);

  return [
    {
      name: "Golden Boot",
      player: goldenBootCandidate,
      won: Math.random() < bootChance,
    },
    {
      name: "MVP",
      player: mvpCandidate,
      won: Math.random() < mvpChance,
    },
  ];
}

function simulateMatch(teamRating, opponentRating, mode) {
  const diff = teamRating - opponentRating;
  const winChance = clamp(
    SIM_CONFIG.minWinChance,
    SIM_CONFIG.maxWinChance,
    SIM_CONFIG.winBase + diff * SIM_CONFIG.winSlope,
  );
  const drawChance = clamp(
    SIM_CONFIG.minDrawChance,
    SIM_CONFIG.maxDrawChance,
    SIM_CONFIG.drawBase - Math.abs(diff) * SIM_CONFIG.drawSlope,
  );
  const roll = Math.random();
  let outcome = "L";

  if (roll < winChance) {
    outcome = "W";
  } else if (roll < winChance + drawChance && mode === "league") {
    outcome = "D";
  } else if (roll < winChance + drawChance && mode === "knockout") {
    outcome = Math.random() < clamp(SIM_CONFIG.upsetFloor, 0.72, 0.5 + diff * 0.03) ? "W" : "L";
  }

  return createScoreline(outcome, diff);
}

function createScoreline(outcome, diff) {
  const attackLift = clamp(-1, 2.4, diff / 5);
  if (outcome === "W") {
    const forGoals = randomInt(1, 3) + (Math.random() < 0.24 + attackLift * 0.05 ? 1 : 0);
    const againstGoals = randomInt(0, Math.max(0, forGoals - 1));
    return { outcome, forGoals, againstGoals };
  }
  if (outcome === "D") {
    const goals = randomInt(0, 2);
    return { outcome, forGoals: goals, againstGoals: goals };
  }
  const againstGoals = randomInt(1, 3) + (Math.random() < 0.2 - attackLift * 0.04 ? 1 : 0);
  const forGoals = randomInt(0, Math.max(0, againstGoals - 1));
  return { outcome, forGoals, againstGoals };
}

function recalculateBudget() {
  const playerSpend = getLineupPlayers().reduce((sum, player) => sum + player.price, 0);
  const manager = managerById.get(state.selectedManagerId);
  const managerSpend = manager ? manager.price : 0;
  currentBudget = STARTING_BUDGET - playerSpend - managerSpend;
  return currentBudget;
}

function calculateBaseRating(players) {
  if (!players.length) return 0;
  return players.reduce((sum, player) => sum + player.ovr, 0) / players.length;
}

function getLineupPlayers() {
  return getCurrentSlots()
    .map((slotData) => playerById.get(state.lineup[slotData.id]))
    .filter(Boolean);
}

function getCurrentSlots() {
  return formations[state.formation] || formations["4-3-3"];
}

function normalizeStateForFormation() {
  if (!formations[state.formation]) {
    state.formation = "4-3-3";
  }

  const validSlots = new Set(getCurrentSlots().map((slotData) => slotData.id));
  const nextLineup = {};
  Object.entries(state.lineup).forEach(([slotId, playerId]) => {
    if (validSlots.has(slotId) && playerById.has(playerId)) {
      nextLineup[slotId] = playerId;
    }
  });
  state.lineup = nextLineup;
}

function getFilteredPlayers() {
  const search = state.search.trim().toLowerCase();
  return playerDatabase.filter((player) => {
    const searchText = `${player.name} ${player.club} ${player.nationality}`.toLowerCase();
    const matchesSearch = !search || searchText.includes(search);
    const matchesPosition = state.positionFilter === "ALL" || player.position === state.positionFilter;
    const matchesStatus = state.statusFilter === "ALL" || player.status === state.statusFilter;
    return matchesSearch && matchesPosition && matchesStatus;
  });
}

function findFirstCompatibleSlot(playerId, emptyOnly) {
  const player = playerById.get(playerId);
  if (!player) return null;
  return getCurrentSlots().find((slotData) => {
    if (emptyOnly && state.lineup[slotData.id]) return false;
    return canPlaySlot(player, slotData);
  });
}

function findPlayerSlot(playerId) {
  return Object.entries(state.lineup).find(([, value]) => value === playerId)?.[0] || null;
}

function canPlaySlot(player, slotData) {
  return (compatibility[slotData.position] || [slotData.position]).includes(player.position);
}

function slot(label, position, x, y) {
  return {
    id: label,
    label,
    position,
    x,
    y,
  };
}

function cardTier(player) {
  if (player.status === "Icon") return "icon";
  if (player.ovr >= 90) return "walkout";
  return "gold";
}

function getInitialPlayerImage(player) {
  const cachedPhoto = photoCache.get(player.id);
  return typeof cachedPhoto === "string" ? cachedPhoto : getAvatar(player);
}

function attachImageFallbacks(root, player) {
  root.querySelectorAll(`img[data-player-image="${player.id}"]`).forEach((img) => {
    img.addEventListener("error", () => {
      const fallback = getAvatar(player);
      if (img.src !== fallback) {
        img.classList.remove("real-photo");
        img.src = fallback;
      }
    });
  });
}

function hydrateVisiblePlayerImages(players) {
  if (typeof fetch !== "function") return;

  const uniquePlayers = new Map(players.map((player) => [player.id, player]));
  uniquePlayers.forEach((player) => {
    const cachedPhoto = photoCache.get(player.id);
    if (cachedPhoto === null) return;

    if (typeof cachedPhoto === "string") {
      applyResolvedPlayerPhoto(player, cachedPhoto);
      return;
    }

    resolvePlayerPhoto(player).then((photoUrl) => {
      if (photoUrl) {
        applyResolvedPlayerPhoto(player, photoUrl);
      }
    });
  });
}

function applyResolvedPlayerPhoto(player, photoUrl) {
  document.querySelectorAll(`img[data-player-image="${player.id}"]`).forEach((img) => {
    if (img.src !== photoUrl) {
      img.src = photoUrl;
    }
    img.classList.add("real-photo");
  });
}

function resolvePlayerPhoto(player) {
  if (photoCache.has(player.id)) {
    const cachedPhoto = photoCache.get(player.id);
    if (typeof cachedPhoto === "string" || cachedPhoto === null) {
      return Promise.resolve(cachedPhoto);
    }
    return cachedPhoto;
  }

  const photoRequest = fetchWikipediaSummary(player.wikiTitle || player.name)
    .then(async (summary) => {
      if (getPhotoUrlFromSummary(summary)) return summary;
      const title = await searchWikipediaTitle(`${player.name} footballer`);
      return title ? fetchWikipediaSummary(title) : null;
    })
    .then((summary) => getPhotoUrlFromSummary(summary))
    .then((photoUrl) => {
      photoCache.set(player.id, photoUrl || null);
      return photoUrl;
    })
    .catch(() => {
      photoCache.set(player.id, null);
      return null;
    });

  photoCache.set(player.id, photoRequest);
  return photoRequest;
}

function fetchWikipediaSummary(title) {
  const pageTitle = encodeURIComponent(title).replaceAll("%20", "_");
  return fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${pageTitle}`, {
    headers: { accept: "application/json" },
  }).then((response) => (response.ok ? response.json() : null));
}

function searchWikipediaTitle(query) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    list: "search",
    srsearch: query,
    format: "json",
    origin: "*",
  }).toString();

  return fetch(url)
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => data?.query?.search?.[0]?.title || null);
}

function getPhotoUrlFromSummary(summary) {
  return summary?.thumbnail?.source || summary?.originalimage?.source || null;
}

function getAvatar(player) {
  if (avatarCache.has(player.id)) {
    return avatarCache.get(player.id);
  }

  const canvas = document.createElement("canvas");
  canvas.width = 220;
  canvas.height = 260;
  const ctx = canvas.getContext("2d");
  const hue = hashString(player.name) % 360;
  const jersey = player.status === "Icon" ? "#f3d176" : `hsl(${hue}, 64%, 48%)`;
  const jerseyDark = player.status === "Icon" ? "#8a641b" : `hsl(${(hue + 24) % 360}, 70%, 26%)`;

  const gradient = ctx.createLinearGradient(0, 0, 220, 260);
  gradient.addColorStop(0, "rgba(255,255,255,0.22)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 220, 260);

  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.beginPath();
  ctx.ellipse(110, 240, 70, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = jerseyDark;
  roundRect(ctx, 48, 143, 124, 104, 34);
  ctx.fill();

  ctx.fillStyle = jersey;
  ctx.beginPath();
  ctx.moveTo(70, 148);
  ctx.lineTo(150, 148);
  ctx.lineTo(176, 246);
  ctx.lineTo(44, 246);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.62)";
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(85, 154);
  ctx.lineTo(110, 196);
  ctx.lineTo(135, 154);
  ctx.stroke();

  ctx.fillStyle = "#c9905a";
  ctx.beginPath();
  ctx.arc(110, 92, 48, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2b2019";
  ctx.beginPath();
  ctx.ellipse(110, 58, 45, 24, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.72)";
  ctx.font = "900 34px Inter, Arial, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials(player.name), 110, 205);

  const url = canvas.toDataURL("image/png");
  avatarCache.set(player.id, url);
  return url;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function estimateLeaguePosition(points, rivalPoints) {
  if (points >= rivalPoints - 3) return 2;
  if (points >= 78) return randomInt(2, 3);
  if (points >= 70) return randomInt(3, 5);
  if (points >= 62) return randomInt(5, 8);
  if (points >= 52) return randomInt(8, 12);
  return randomInt(12, 17);
}

function pickOpponent(name, round, rating) {
  const uclOpponents = [
    "Madrid Royals",
    "Munich Reds",
    "Paris Elite",
    "Manchester Blues",
    "Milan Serpents",
    "Catalonia Kings",
    "Turin Titans",
    "North London Arsenal",
  ];
  const cupOpponents = [
    "West London FC",
    "Merseyside Red",
    "Tyneside United",
    "Seagull Athletic",
    "Villa Park XI",
    "East London Irons",
    "Nottingham Red",
    "South Coast Saints",
  ];
  const pool = name === "UCL" ? uclOpponents : cupOpponents;
  return `${pool[(hashString(`${name}-${round}-${rating}`) + randomInt(0, pool.length - 1)) % pool.length]} (${rating.toFixed(1)})`;
}

function weightedChoice(players) {
  const sorted = [...players].sort((a, b) => b.ovr - a.ovr);
  const topPool = sorted.slice(0, Math.min(5, sorted.length));
  const totalWeight = topPool.reduce((sum, player) => sum + player.ovr * player.ovr, 0);
  let roll = Math.random() * totalWeight;

  for (const player of topPool) {
    roll -= player.ovr * player.ovr;
    if (roll <= 0) return player;
  }

  return topPool[0];
}

function initAuthControls() {
  setAuthStatus("Guest");
  updateAuthControls();
}

async function checkAuthSession() {
  if (!isNetworkHosted()) {
    setAuthStatus("Login needs server", "error");
    return;
  }

  try {
    const data = await apiRequest("/api/me");
    auth.user = data.user;
    updateAuthControls();
    setAuthStatus(auth.user ? `@${auth.user.username}` : "Guest", auth.user ? "connected" : "");

    if (auth.user) {
      await loadProgressFromServer();
    }
  } catch {
    setAuthStatus("Auth offline", "error");
  }
}

async function submitAuth(mode) {
  if (!isNetworkHosted()) {
    showToast("Open the http:// app to use accounts.");
    return;
  }

  const username = els.usernameInput.value.trim();
  const password = els.passwordInput.value;

  if (!username || !password) {
    showToast("Enter username and password.");
    return;
  }

  setAuthStatus(mode === "login" ? "Logging in" : "Registering", "saving");

  try {
    const data = await apiRequest(`/api/${mode}`, {
      method: "POST",
      body: { username, password },
    });

    auth.user = data.user;
    els.passwordInput.value = "";
    updateAuthControls();
    setAuthStatus(`@${auth.user.username}`, "connected");

    if (data.progress) {
      applySavedProgress(data.progress);
      showToast("Saved progress loaded.");
    } else {
      await saveProgressToServer();
      showToast(mode === "login" ? "Logged in." : "Account created.");
    }
  } catch (error) {
    setAuthStatus("Auth failed", "error");
    showToast(error.message);
  }
}

async function logout() {
  try {
    await apiRequest("/api/logout", { method: "POST" });
  } catch {
    // Logging out locally is still useful if the server has already dropped the session.
  }

  auth.user = null;
  window.clearTimeout(auth.saveTimer);
  updateAuthControls();
  setAuthStatus("Guest");
  showToast("Logged out.");
}

async function loadProgressFromServer() {
  try {
    const data = await apiRequest("/api/progress");
    if (data.progress) {
      applySavedProgress(data.progress);
      showToast("Account progress loaded.");
    } else {
      await saveProgressToServer();
    }
  } catch (error) {
    setAuthStatus("Load failed", "error");
    showToast(error.message);
  }
}

function applySavedProgress(progress) {
  isApplyingRemoteState = true;
  state = {
    ...state,
    ...sanitizeSharedState(progress),
    selectedSlotId: null,
  };
  normalizeStateForFormation();
  els.formationSelect.value = state.formation;
  render();
  isApplyingRemoteState = false;
  broadcastSharedState();
}

function scheduleProgressSave() {
  if (!auth.user || auth.isSaving || isApplyingRemoteState) return;
  window.clearTimeout(auth.saveTimer);
  auth.saveTimer = window.setTimeout(() => {
    saveProgressToServer();
  }, 650);
}

async function saveProgressToServer() {
  if (!auth.user || auth.isSaving || !isNetworkHosted()) return;

  auth.isSaving = true;
  setAuthStatus("Saving", "saving");

  try {
    const data = await apiRequest("/api/progress", {
      method: "PUT",
      body: { state: getSharedState() },
    });
    auth.user = {
      ...auth.user,
      updatedAt: data.progress?.savedAt || new Date().toISOString(),
    };
    setAuthStatus(`Saved @${auth.user.username}`, "connected");
  } catch (error) {
    setAuthStatus("Save failed", "error");
    showToast(error.message);
  } finally {
    auth.isSaving = false;
  }
}

function updateAuthControls() {
  const loggedIn = Boolean(auth.user);
  els.usernameInput.disabled = loggedIn;
  els.passwordInput.disabled = loggedIn;
  els.loginButton.hidden = loggedIn;
  els.registerButton.hidden = loggedIn;
  els.logoutButton.hidden = !loggedIn;
  if (loggedIn) {
    els.usernameInput.value = auth.user.username;
  }
}

function setAuthStatus(label, status = "") {
  els.authStatus.textContent = label;
  els.authStatus.className = `auth-status${status ? ` ${status}` : ""}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "same-origin",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

function initMultiplayerControls() {
  const roomFromUrl = getRoomFromUrl();
  const savedRoom = localStorage.getItem(ROOM_KEY);
  els.roomInput.value = normalizeRoomId(roomFromUrl || savedRoom || els.roomInput.value || "DREAMXI");
  setRoomStatus(isNetworkHosted() ? "Ready" : "Local only", isNetworkHosted() ? "" : "error");
}

function autoJoinRoomFromUrl() {
  const roomFromUrl = getRoomFromUrl();
  if (roomFromUrl && isNetworkHosted()) {
    connectToRoom(roomFromUrl);
  }
}

function connectToRoom(roomValue) {
  const roomId = normalizeRoomId(roomValue || "DREAMXI");
  if (!roomId) {
    showToast("Enter a room code first.");
    return;
  }

  els.roomInput.value = roomId;
  localStorage.setItem(ROOM_KEY, roomId);

  if (!isNetworkHosted()) {
    setRoomStatus("Server needed", "error");
    showToast("Run the Node server first, then open the http:// address to play online.");
    return;
  }

  if (multiplayer.socket) {
    multiplayer.socket.close(1000, "Switching rooms");
  }

  multiplayer.roomId = roomId;
  updateRoomUrl(roomId);
  setRoomStatus("Connecting", "connecting");

  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  const socket = new WebSocket(`${protocol}//${location.host}/ws?room=${encodeURIComponent(roomId)}`);
  multiplayer.socket = socket;

  socket.addEventListener("open", () => {
    sendRoomMessage({ type: "join", roomId, clientId: multiplayer.clientId, state: getSharedState() });
    setRoomStatus("Connected", "connected");
    showToast(`Joined room ${roomId}.`);
  });

  socket.addEventListener("message", (event) => {
    handleRoomMessage(event.data);
  });

  socket.addEventListener("close", () => {
    if (multiplayer.socket === socket) {
      setRoomStatus("Offline", "error");
    }
  });

  socket.addEventListener("error", () => {
    setRoomStatus("Error", "error");
    showToast("Could not connect to the multiplayer server.");
  });
}

function handleRoomMessage(rawMessage) {
  let message;
  try {
    message = JSON.parse(rawMessage);
  } catch {
    return;
  }

  if (message.clientId === multiplayer.clientId) return;

  if (message.type === "snapshot" && message.state) {
    multiplayer.peers = message.peers || multiplayer.peers;
    applySharedState(message.state);
    setRoomStatus(`${multiplayer.peers} online`, "connected");
  }

  if (message.type === "state:update" && message.state) {
    applySharedState(message.state);
  }

  if (message.type === "presence") {
    multiplayer.peers = message.peers || 1;
    setRoomStatus(`${multiplayer.peers} online`, "connected");
  }

  if (message.type === "server:error") {
    showToast(message.message || "Multiplayer server error.");
  }
}

function applySharedState(sharedState) {
  isApplyingRemoteState = true;
  state = {
    ...state,
    ...sanitizeSharedState(sharedState),
    selectedSlotId: null,
  };
  normalizeStateForFormation();
  els.formationSelect.value = state.formation;
  render();
  isApplyingRemoteState = false;
}

function broadcastSharedState() {
  if (isApplyingRemoteState) return;
  if (!multiplayer.socket || multiplayer.socket.readyState !== WebSocket.OPEN) return;
  sendRoomMessage({
    type: "state:update",
    roomId: multiplayer.roomId,
    clientId: multiplayer.clientId,
    state: getSharedState(),
  });
}

function sendRoomMessage(message) {
  if (!multiplayer.socket || multiplayer.socket.readyState !== WebSocket.OPEN) return;
  multiplayer.socket.send(JSON.stringify(message));
}

function getSharedState() {
  return {
    formation: state.formation,
    lineup: state.lineup,
    selectedManagerId: state.selectedManagerId,
    review: state.review,
  };
}

function sanitizeSharedState(sharedState) {
  const formation = formations[sharedState.formation] ? sharedState.formation : "4-3-3";
  const validSlots = new Set(formations[formation].map((slotData) => slotData.id));
  const lineup = {};

  Object.entries(sharedState.lineup || {}).forEach(([slotId, playerId]) => {
    if (validSlots.has(slotId) && playerById.has(playerId)) {
      lineup[slotId] = playerId;
    }
  });

  return {
    formation,
    lineup,
    selectedManagerId: managerById.has(sharedState.selectedManagerId) ? sharedState.selectedManagerId : null,
    review: sharedState.review && typeof sharedState.review === "object" ? sharedState.review : null,
  };
}

function copyRoomLink() {
  const roomId = normalizeRoomId(els.roomInput.value || multiplayer.roomId || "DREAMXI");
  els.roomInput.value = roomId;

  if (!isNetworkHosted()) {
    showToast("Start the Node server first so the room has a shareable http link.");
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.set("room", roomId);

  navigator.clipboard
    ?.writeText(url.toString())
    .then(() => showToast("Room link copied."))
    .catch(() => showToast(url.toString()));
}

function getRoomFromUrl() {
  return normalizeRoomId(new URLSearchParams(window.location.search).get("room") || "");
}

function updateRoomUrl(roomId) {
  const url = new URL(window.location.href);
  url.searchParams.set("room", roomId);
  window.history.replaceState(null, "", url);
}

function normalizeRoomId(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "")
    .slice(0, 16);
}

function setRoomStatus(label, status = "") {
  els.roomStatus.textContent = label;
  els.roomStatus.className = `room-status${status ? ` ${status}` : ""}`;
}

function isNetworkHosted() {
  return location.protocol === "http:" || location.protocol === "https:";
}

function loadState() {
  const fallback = {
    formation: "4-3-3",
    lineup: {},
    selectedManagerId: null,
    selectedSlotId: null,
    search: "",
    positionFilter: "ALL",
    statusFilter: "ALL",
    review: null,
  };

  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (!saved || typeof saved !== "object") return fallback;
    return {
      ...fallback,
      ...saved,
      lineup: saved.lineup && typeof saved.lineup === "object" ? saved.lineup : {},
    };
  } catch {
    return fallback;
  }
}

function saveState() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {
    // Storage can fail in strict browser modes; the app still works for the session.
  }
}

function showToast(message) {
  window.clearTimeout(toastTimer);
  els.toast.textContent = message;
  els.toast.classList.add("show");
  toastTimer = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2300);
}

function formatMoney(value) {
  return `${Math.max(0, Math.round(value))}M`;
}

function sortPositions(a, b) {
  const order = ["GK", "LB", "CB", "RB", "LWB", "RWB", "CDM", "CM", "CAM", "LM", "RM", "LW", "RW", "CF", "ST"];
  return order.indexOf(a) - order.indexOf(b);
}

function lastName(name) {
  const parts = name.split(" ");
  return parts[parts.length - 1];
}

function initials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(min, max, value) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function normalLike(mean, deviation) {
  return mean + (Math.random() + Math.random() + Math.random() - 1.5) * deviation;
}

window.FootballCommandCenter = {
  playerDatabase,
  managers,
  formations,
  simulateSeason,
  getState: () => structuredClone(state),
  setSimulationConfig: (nextConfig) => Object.assign(SIM_CONFIG, nextConfig),
};
