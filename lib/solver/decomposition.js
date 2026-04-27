/* eslint-disable new-cap */
"use strict";

const constants = require("../core/constants");
const Tile = require("../core/tile");
const DecompositionPack = require("../model/decomposition-pack");

const createCountTable = () => Array(constants.TILE_SIZE + 1).fill(0);

const cloneExistingPack = pack =>
  new DecompositionPack({
    type: pack.GetType(),
    tile: pack.GetMiddleTile().clone(),
    offer: pack.GetOffer()
  });

const createPack = (type, tile, offer = 0) =>
  new DecompositionPack({
    type,
    tile: new Tile(tile),
    offer
  });

const isNumberedTile = tile =>
  constants.TILES_SUIT[tile] === constants.SUIT_WAN ||
  constants.TILES_SUIT[tile] === constants.SUIT_TIAO ||
  constants.TILES_SUIT[tile] === constants.SUIT_BING;

const canMakeSequence = (counts, tile) =>
  isNumberedTile(tile) &&
  constants.TILES_RANK[tile] <= 7 &&
  counts[tile] > 0 &&
  counts[tile + 1] > 0 &&
  counts[tile + 2] > 0 &&
  constants.TILES_SUIT[tile] === constants.TILES_SUIT[tile + 1] &&
  constants.TILES_SUIT[tile] === constants.TILES_SUIT[tile + 2];

const findFirstTile = counts => {
  for (let tile = constants.TILE_1m; tile <= constants.TILE_P; tile += 1) {
    if (counts[tile] > 0) {
      return tile;
    }
  }

  return null;
};

const isCompleteHandShape = hand =>
  hand.packs.length * 3 + hand.tiles.length === 14;

const buildCounts = tiles => {
  const counts = createCountTable();

  tiles.forEach(tile => {
    counts[tile.GetId()] += 1;
  });

  return counts;
};

const searchMelds = (counts, currentPacks, decompositions) => {
  const tile = findFirstTile(counts);

  if (tile === null) {
    decompositions.push(currentPacks.slice());
    return;
  }

  if (counts[tile] >= 3) {
    counts[tile] -= 3;
    currentPacks.push(createPack(constants.PACK_TYPE_KEZI, tile));
    searchMelds(counts, currentPacks, decompositions);
    currentPacks.pop();
    counts[tile] += 3;
  }

  if (canMakeSequence(counts, tile)) {
    counts[tile] -= 1;
    counts[tile + 1] -= 1;
    counts[tile + 2] -= 1;
    currentPacks.push(createPack(constants.PACK_TYPE_SHUNZI, tile + 1));
    searchMelds(counts, currentPacks, decompositions);
    currentPacks.pop();
    counts[tile] += 1;
    counts[tile + 1] += 1;
    counts[tile + 2] += 1;
  }
};

const enumerateDecompositions = hand => {
  if (!hand || !isCompleteHandShape(hand)) {
    return [];
  }

  const counts = buildCounts(hand.tiles);
  const decompositions = [];
  const fixedPacks = hand.packs.map(cloneExistingPack);

  for (let tile = constants.TILE_1m; tile <= constants.TILE_P; tile += 1) {
    if (counts[tile] < 2) {
      continue;
    }

    counts[tile] -= 2;

    searchMelds(
      counts,
      [...fixedPacks, createPack(constants.PACK_TYPE_JIANG, tile)],
      decompositions
    );

    counts[tile] += 2;
  }

  return decompositions.filter(packs => packs.length === 5);
};

module.exports = {
  enumerateDecompositions
};
