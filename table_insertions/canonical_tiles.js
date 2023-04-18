"use strict";

const pg = require("pg");
const format = require("pg-format");

let tiles = [
  [" ", 0],
  [" ", 0],
  ["A", 1],
  ["A", 1],
  ["A", 1],
  ["A", 1],
  ["A", 1],
  ["A", 1],
  ["A", 1],
  ["A", 1],
  ["A", 1],
  ["B", 3],
  ["B", 3],
  ["C", 3],
  ["C", 3],
  ["D", 2],
  ["D", 2],
  ["D", 2],
  ["D", 2],
  ["E", 1],
  ["E", 1],
  ["E", 1],
  ["E", 1],
  ["E", 1],
  ["E", 1],
  ["E", 1],
  ["E", 1],
  ["E", 1],
  ["E", 1],
  ["E", 1],
  ["E", 1],
  ["F", 4],
  ["F", 4],
  ["G", 2],
  ["G", 2],
  ["G", 2],
  ["H", 4],
  ["H", 4],
  ["I", 1],
  ["I", 1],
  ["I", 1],
  ["I", 1],
  ["I", 1],
  ["I", 1],
  ["I", 1],
  ["I", 1],
  ["I", 1],
  ["J", 8],
  ["K", 5],
  ["L", 1],
  ["L", 1],
  ["L", 1],
  ["L", 1],
  ["M", 3],
  ["M", 3],
  ["N", 1],
  ["N", 1],
  ["N", 1],
  ["N", 1],
  ["N", 1],
  ["N", 1],
  ["O", 1],
  ["O", 1],
  ["O", 1],
  ["O", 1],
  ["O", 1],
  ["O", 1],
  ["O", 1],
  ["O", 1],
  ["P", 3],
  ["P", 3],
  ["Q", 10],
  ["R", 1],
  ["R", 1],
  ["R", 1],
  ["R", 1],
  ["R", 1],
  ["R", 1],
  ["S", 1],
  ["S", 1],
  ["S", 1],
  ["S", 1],
  ["T", 1],
  ["T", 1],
  ["T", 1],
  ["T", 1],
  ["T", 1],
  ["T", 1],
  ["U", 1],
  ["U", 1],
  ["U", 1],
  ["U", 1],
  ["V", 4],
  ["V", 4],
  ["W", 4],
  ["W", 4],
  ["X", 8],
  ["Y", 4],
  ["Y", 4],
  ["Z", 10],
];
let query = format(
  "INSERT INTO canonical_tiles (letter, point_value) VALUES %L RETURNING id",
  tiles
);

async function run() {
  let client;
  try {
    client = new pg.Client({
      // connectionString:
    });
    await client.connect();
    let { rows } = await client.query(query);
    console.log(rows);
  } catch (e) {
    console.error(e);
  } finally {
    client.end();
  }
}

run();
