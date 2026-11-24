const sf = require("stockfish")("lite-single", line => {
  if (line.startsWith("info") && line.includes(" depth 16 ")) console.log(line.slice(0,160));
  if (line.startsWith("bestmove")) { console.log(line, (Date.now()-t)+"ms"); sf.terminate(); }
});
let t=Date.now();
sf.processCommand("uci"); sf.processCommand("position startpos moves e2e4 g7g6 d2d4 f8g7"); sf.processCommand("go depth 16");
