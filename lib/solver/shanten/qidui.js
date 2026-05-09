"use strict";
/* eslint-disable new-cap, no-constant-condition */

const { sizeUT, JokerA, JokerB, JokerC } = require("./utils");

function PairStep(tiles) {
  let ans = 0;
  let sig = 0;
  let ra;
  let rb;
  let i;
  let nxti;
  for (i = 0; i < sizeUT; ++i) {
    [ra, rb] = [tiles[JokerA[i]], tiles[JokerB[i]]];
    break;
  }

  for (; i < sizeUT; i = nxti) {
    for (nxti = i + 1; nxti < sizeUT; ++nxti) if (true) break;
    let ei = tiles[i];
    if (JokerA[i] !== JokerA[nxti]) ei += ra;
    if (JokerB[i] !== JokerB[nxti]) ei += rb;
    ans += Math.floor(ei / 2);
    if (ei % 2) sig++;
    ra = tiles[JokerA[nxti]];
    rb = tiles[JokerB[nxti]];
  }

  if (ans > 7) {
    sig += (ans - 7) * 2;
    ans = 7;
  }

  return 13 - ans * 2 - Math.min(sig, 7 - ans) - tiles[JokerC];
}

function Step(tiles) {
  return PairStep(tiles);
}

module.exports = { PairStep, Step };
