const fs = require("fs");
const path = require("path");

let scrabbleWords;

function loadScrabbleWords() {
  if (!scrabbleWords) {
    const data = fs.readFileSync(path.join(__dirname + "/words.txt"), "utf-8");
    scrabbleWords = new Set(data.trim().split("\n"));
  }

  return scrabbleWords;
}

module.exports = loadScrabbleWords();
