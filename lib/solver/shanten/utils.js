"use strict";

const constants = require("../../core/constants");

const sizeUT = 34;
const sizeAT = 51;

const SeqArray = [
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
];

function SeqCheck(i) {
  return i >= 0 && i < sizeUT ? SeqArray[i] : false;
}

function toTestIndex(id) {
  if (id >= 1 && id <= 9) return id - 1;
  if (id >= 10 && id <= 18) return id - 10 + 9;
  if (id >= 19 && id <= 27) return id - 19 + 18;
  if (id === 28) return 27;
  if (id === 29) return 28;
  if (id === 30) return 29;
  if (id === 31) return 30;
  if (id === 32) return 31;
  if (id === 33) return 32;
  if (id === 34) return 33;
  return 0;
}

function fromTestIndex(i) {
  if (i >= 0 && i <= 8) return i + 1;
  if (i >= 9 && i <= 17) return i - 9 + 10;
  if (i >= 18 && i <= 26) return i - 18 + 19;
  if (i === 27) return 28;
  if (i === 28) return 29;
  if (i === 29) return 30;
  if (i === 30) return 31;
  if (i === 31) return 32;
  if (i === 32) return 33;
  if (i === 33) return 34;
  return constants.TILE_INVALID;
}

function countTilesFromHand(handtiles) {
  const tiles = Array(sizeAT).fill(0);
  for (const tile of handtiles.lipai) {
    const id = tile.GetId(); // eslint-disable-line new-cap
    if (id === constants.TILE_INVALID) continue;
    if (id >= constants.TILE_MEI && id <= constants.TILE_DONG) continue;
    tiles[toTestIndex(id)]++;
  }

  return tiles;
}

function countFuluTiles(handtiles) {
  const used = Array(sizeUT).fill(0);
  for (const pack of handtiles.fulu) {
    const all = pack.GetAllTile(); // eslint-disable-line new-cap
    for (const tile of all) {
      const idx = toTestIndex(tile.GetId()); // eslint-disable-line new-cap
      if (idx >= 0 && idx < sizeUT) used[idx]++;
    }
  }

  return used;
}

module.exports = {
  sizeUT,
  sizeAT,
  SeqArray,
  SeqCheck,
  toTestIndex,
  fromTestIndex,
  countTilesFromHand,
  countFuluTiles
};
