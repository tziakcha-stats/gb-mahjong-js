/* eslint-disable new-cap */
"use strict";

const constants = require("../core/constants");

const ZUHELONG_COMBINATIONS = [
  [
    [constants.TILE_1m, constants.TILE_4m, constants.TILE_7m],
    [constants.TILE_2s, constants.TILE_5s, constants.TILE_8s],
    [constants.TILE_3p, constants.TILE_6p, constants.TILE_9p]
  ],
  [
    [constants.TILE_1m, constants.TILE_4m, constants.TILE_7m],
    [constants.TILE_2p, constants.TILE_5p, constants.TILE_8p],
    [constants.TILE_3s, constants.TILE_6s, constants.TILE_9s]
  ],
  [
    [constants.TILE_1s, constants.TILE_4s, constants.TILE_7s],
    [constants.TILE_2m, constants.TILE_5m, constants.TILE_8m],
    [constants.TILE_3p, constants.TILE_6p, constants.TILE_9p]
  ],
  [
    [constants.TILE_1s, constants.TILE_4s, constants.TILE_7s],
    [constants.TILE_2p, constants.TILE_5p, constants.TILE_8p],
    [constants.TILE_3m, constants.TILE_6m, constants.TILE_9m]
  ],
  [
    [constants.TILE_1p, constants.TILE_4p, constants.TILE_7p],
    [constants.TILE_2m, constants.TILE_5m, constants.TILE_8m],
    [constants.TILE_3s, constants.TILE_6s, constants.TILE_9s]
  ],
  [
    [constants.TILE_1p, constants.TILE_4p, constants.TILE_7p],
    [constants.TILE_2s, constants.TILE_5s, constants.TILE_8s],
    [constants.TILE_3m, constants.TILE_6m, constants.TILE_9m]
  ]
];

const SHISANYAO_TILES = new Set([
  constants.TILE_1m,
  constants.TILE_9m,
  constants.TILE_1s,
  constants.TILE_9s,
  constants.TILE_1p,
  constants.TILE_9p,
  constants.TILE_E,
  constants.TILE_S,
  constants.TILE_W,
  constants.TILE_N,
  constants.TILE_C,
  constants.TILE_F,
  constants.TILE_P
]);

const isCompleteClosedHand = hand =>
  Boolean(hand) && hand.packs.length === 0 && hand.tiles.length === 14;

const buildCounts = hand => {
  const counts = new Map();

  hand.tiles.forEach(tile => {
    const id = tile.GetId();
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });

  return counts;
};

const isQidui = hand => {
  if (!isCompleteClosedHand(hand)) {
    return false;
  }

  let pairCount = 0;

  for (const count of buildCounts(hand).values()) {
    if (count !== 2 && count !== 4) {
      return false;
    }

    pairCount += count / 2;
  }

  return pairCount === 7;
};

const isShisanyao = hand => {
  if (!isCompleteClosedHand(hand)) {
    return false;
  }

  const uniqueTiles = new Set(hand.tiles.map(tile => tile.GetId()));

  if (uniqueTiles.size !== 13) {
    return false;
  }

  return hand.tiles.every(tile => SHISANYAO_TILES.has(tile.GetId()));
};

const isMeaningfulTile = tileId =>
  tileId >= constants.TILE_1m && tileId <= constants.TILE_P;

const isHonorTile = tileId =>
  tileId >= constants.TILE_E && tileId <= constants.TILE_P;

const isPartOfZuhelong = numberedTiles =>
  ZUHELONG_COMBINATIONS.some(combination => {
    const allowedTiles = new Set(combination.flat());
    return numberedTiles.every(tileId => allowedTiles.has(tileId));
  });

const isBukaoStructure = hand => {
  if (!isCompleteClosedHand(hand)) {
    return false;
  }

  const tileIds = hand.tiles.map(tile => tile.GetId());
  const uniqueTiles = new Set(tileIds);

  if (uniqueTiles.size !== 14 || !tileIds.every(isMeaningfulTile)) {
    return false;
  }

  const numberedTiles = tileIds.filter(tileId => tileId <= constants.TILE_9p);

  return isPartOfZuhelong(numberedTiles);
};

const isQuanbukao = hand => {
  if (!isBukaoStructure(hand)) {
    return false;
  }

  const honorCount = hand.tiles.filter(tile => isHonorTile(tile.GetId()))
    .length;

  return honorCount < 7;
};

const isQixingbukao = hand => {
  if (!isBukaoStructure(hand)) {
    return false;
  }

  const honorCount = hand.tiles.filter(tile => isHonorTile(tile.GetId()))
    .length;

  return honorCount === 7;
};

function hasSpecialHu(hand) {
  return (
    isQidui(hand) ||
    isShisanyao(hand) ||
    isQuanbukao(hand) ||
    isQixingbukao(hand)
  );
}

module.exports = {
  hasSpecialHu,
  isQidui,
  isShisanyao,
  isQuanbukao,
  isQixingbukao
};
