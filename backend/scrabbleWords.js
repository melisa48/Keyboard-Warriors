const fs = require("fs");
const path = require("path");

let scrabbleWords;

function loadScrabbleWords() {
  if (!scrabbleWords) {
    console.log("LOADING THE SCRABBLE WORDS");
    const data = fs.readFileSync(path.join(__dirname + "/words.txt"), "utf-8");
    scrabbleWords = new Set(data.trim().split("\n"));
  }

  return scrabbleWords;
}

module.exports = loadScrabbleWords();
