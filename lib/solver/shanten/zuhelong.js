"use strict";

const { searchDp, JokerA, JokerB, JokerC } = require("./utils");
const { KnitDragonSave } = require("./quanbukao");

function KnitDragonStep(tiles, tcnt) {
  let ans = Infinity;
  for (let i = 0; i < 6; ++i) {
    let miss = 0;
    let tcp = tiles.slice();
    for (let j = 0; j < 9; ++j) {
      const id = KnitDragonSave[i][j];
      if (tcp[id]) --tcp[id];
      else if (tcp[JokerA[id]]) --tcp[JokerA[id]];
      else if (tcp[JokerB[id]]) --tcp[JokerB[id]];
      else ++miss;
    }

    if (miss - 1 - tiles[JokerC] >= ans) continue;
    ans = Math.min(ans, searchDp(tcp, 3, 0, tcnt, ans - miss) + miss);
  }

  return ans;
}

module.exports = { KnitDragonStep };
