"use strict";
/* eslint-disable new-cap */

const { JokerA, JokerB, JokerC } = require("./utils");

const Orphan13Array = [0, 8, 9, 17, 18, 26, 27, 28, 29, 30, 31, 32, 33];

function OrphanCount(tiles, jokerc = true) {
  tiles = tiles.slice();
  let ans = 13;
  for (let i = 0; i < Orphan13Array.length; ++i) {
    const id = Orphan13Array[i];
    if (tiles[id]) --tiles[id];
    else if (tiles[JokerA[id]]) --tiles[JokerA[id]];
    else if (tiles[JokerB[id]]) --tiles[JokerB[id]];
    else if (jokerc && tiles[JokerC]) --tiles[JokerC];
    else --ans;
  }

  return { tiles, count: ans };
}

function OrphanStep(tiles) {
  let main = OrphanCount(tiles, false);
  tiles = main.tiles;
  let ans = 13 - main.count;
  for (let i = 0; i < Orphan13Array.length; ++i) {
    const id = Orphan13Array[i];
    if (tiles[id]) return ans - 1 - tiles[JokerC];
    if (tiles[JokerA[id]]) return ans - 1 - tiles[JokerC];
    if (tiles[JokerB[id]]) return ans - 1 - tiles[JokerC];
  }

  return ans - tiles[JokerC];
}

module.exports = { OrphanStep, OrphanCount };
