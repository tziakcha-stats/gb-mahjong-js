/* eslint-disable new-cap */
"use strict";

const constants = require("../core/constants");
const Tile = require("../core/tile");
const Hand = require("../model/hand");
const { normalizeHandInput } = require("../api/normalize-hand");
const { judgeHu } = require("./judge-hu");

const compareTiles = (left, right) => left.GetId() - right.GetId();

const isWinningTileCandidate = tileId =>
  tileId >= constants.TILE_1m && tileId <= constants.TILE_P;

const toTile = tile => (tile instanceof Tile ? tile.clone() : new Tile(tile));

const createVisibleTileTable = hand => {
  const counts = Array(constants.TILE_MAJIANG + 1).fill(0);

  hand.tiles.forEach(tile => {
    counts[tile.GetId()] += 1;
  });

  hand.packs.forEach(pack => {
    pack.GetAllTile().forEach(tile => {
      counts[tile.GetId()] += 1;
    });
  });

  return counts;
};

const cloneHandWithWinningTile = (hand, tile) => {
  const winningTile = toTile(tile);
  const tiles = hand.tiles.slice();

  if (hand.winningTile !== null) {
    const winningTileIndex = tiles.findIndex(
      candidate => candidate.GetId() === hand.winningTile.GetId()
    );

    if (winningTileIndex !== -1) {
      tiles.splice(winningTileIndex, 1);
    }
  }

  tiles.push(winningTile.clone());
  tiles.sort(compareTiles);

  return new Hand({
    tiles,
    packs: hand.packs.slice(),
    winningTile,
    flowers: hand.flowers.slice(),
    context: hand.context,
    source: hand.source
  });
};

const judgeHuTileForHand = (hand, tile) => {
  const tileId = tile instanceof Tile ? tile.GetId() : tile;

  if (!isWinningTileCandidate(tileId)) {
    return false;
  }

  return judgeHu(cloneHandWithWinningTile(hand, tileId));
};

const judgeHuTile = (input, tile, options = {}) => {
  const hand = normalizeHandInput(input, options);

  return judgeHuTileForHand(hand, tile);
};

const calcTing = (input, options = {}) => {
  const hand = normalizeHandInput(input, options);
  const visibleTileTable = createVisibleTileTable(hand);

  return Array.from(
    { length: constants.TILE_P - constants.TILE_1m + 1 },
    (_, index) => constants.TILE_1m + index
  )
    .filter(
      tileId =>
        (options.includeExhaustedTile || visibleTileTable[tileId] < 4) &&
        judgeHuTileForHand(hand, tileId)
    )
    .map(tileId => new Tile(tileId))
    .sort(compareTiles);
};

module.exports = {
  calcTing,
  cloneHandWithWinningTile,
  judgeHuTile
};
