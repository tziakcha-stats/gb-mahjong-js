"use strict";
/* eslint-disable new-cap, camelcase */

const { sizeUT, SeqCheck, searchDp } = require("./utils");

function Win(tiles, tcnt, glmt = Infinity) {
  const meld = Math.floor(tcnt / 3);
  const head = tcnt % 3;
  for (let i = 0; i < sizeUT; ++i) if (tiles[i] > glmt) return false;
  if (head === 0) return check(tiles, meld);
  for (let i = 0; i < sizeUT; ++i)
    if (tiles[i] >= 2) {
      tiles[i] -= 2;
      const ans = check(tiles, meld);
      tiles[i] += 2;
      if (ans) return true;
    }

  return false;
}

function check(tiles, target) {
  let meld = 0;
  tiles = tiles.slice();
  for (let i = 0; i < sizeUT; ++i) {
    if (tiles[i] >= 3) {
      meld += Math.floor(tiles[i] / 3);
      tiles[i] %= 3;
    }

    if (SeqCheck(i) && tiles[i] && tiles[i + 1] && tiles[i + 2]) {
      const cnt = Math.min(tiles[i], tiles[i + 1], tiles[i + 2]);
      meld += cnt;
      tiles[i] -= cnt;
      tiles[i + 1] -= cnt;
      tiles[i + 2] -= cnt;
    }

    if (tiles[i]) break;
  }

  return meld === target;
}

function Listen(tiles, tcnt, full_tcnt = tcnt, glmt = Infinity) {
  if (tcnt + 1 === full_tcnt) {
    for (let j = 0; j < sizeUT; ++j) {
      if (tiles[j] >= glmt) continue;
      ++tiles[j];
      const ans = Win(tiles, tcnt + 1, glmt);
      --tiles[j];
      if (ans) return true;
    }
  } else if (tcnt === full_tcnt) {
    for (let i = 0; i < sizeUT; ++i) {
      if (!tiles[i]) continue;
      --tiles[i];
      for (let j = 0; j < sizeUT; ++j) {
        if (i === j) continue;
        if (tiles[j] >= glmt) continue;
        ++tiles[j];
        const ans = Win(tiles, tcnt, glmt);
        --tiles[j];
        if (ans) {
          ++tiles[i];
          return true;
        }
      }

      ++tiles[i];
    }
  }

  return false;
}

function Step(
  tiles,
  tcnt = 14,
  full_tcnt = tcnt % 3 === 1 ? tcnt + 1 : tcnt,
  glmt = Infinity
) {
  if (tcnt > full_tcnt) return searchDp(tiles, 0, 0, full_tcnt, Infinity, glmt);
  for (let i = 42; i < 50; ++i)
    if (tiles[i]) return searchDp(tiles, 0, 0, full_tcnt, Infinity, glmt);
  if (tcnt === full_tcnt && Win(tiles, full_tcnt, glmt)) return -1;
  if (Listen(tiles, tcnt, full_tcnt, glmt)) return 0;
  return searchDp(tiles, 0, 0, full_tcnt, Infinity, glmt);
}

module.exports = { Step, Win, Listen };
