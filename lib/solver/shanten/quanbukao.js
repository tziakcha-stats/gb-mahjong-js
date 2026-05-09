"use strict";

const { JokerA, JokerB, JokerC } = require("./utils");

const KnitDragonSave = Array.from({ length: 6 }, () => Array(9).fill(0));
const Permutation3 = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0]
];

function knitDragonCreate() {
  for (let i = 0; i < 6; ++i) {
    for (let j = 0; j < 9; ++j) {
      const di = Math.floor(j / 3);
      const dj = j % 3;
      const id = di * 9 + Permutation3[i][di] + dj * 3;
      KnitDragonSave[i][j] = id;
    }
  }
}

knitDragonCreate();

function bukao16Count(tiles) {
  let ans = 0;
  for (let i = 0; i < 6; ++i) {
    let count = 0;
    const tcp = tiles.slice();
    for (let j = 0; j < 9; ++j) {
      const id = KnitDragonSave[i][j];
      ++count;
      if (tiles[id]) {
        continue;
      } else if (tcp[JokerA[id]]) {
        --tcp[JokerA[id]];
      } else if (tcp[JokerB[id]]) {
        --tcp[JokerB[id]];
      } else {
        --count;
      }
    }

    for (let k = 27; k < 34; ++k) {
      ++count;
      if (tiles[k]) {
        continue;
      } else if (tcp[JokerA[k]]) {
        --tcp[JokerA[k]];
      } else if (tcp[JokerB[k]]) {
        --tcp[JokerB[k]];
      } else {
        --count;
      }
    }

    ans = Math.max(ans, count);
  }

  return ans + tiles[JokerC];
}

module.exports = { bukao16Count };
