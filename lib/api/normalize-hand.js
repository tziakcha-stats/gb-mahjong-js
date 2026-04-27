"use strict";

const Hand = require("../model/hand");
const WinContext = require("../model/win-context");
const parseHand = require("../parser/parse-hand");

const normalizeContext = (baseContext = {}, overrides = {}) =>
  new WinContext({
    ...baseContext,
    ...overrides
  });

const normalizeHandInput = (input, overrides = {}) => {
  const hand =
    typeof input === "string"
      ? parseHand(input)
      : input instanceof Hand
      ? input
      : new Hand(input);

  return new Hand({
    tiles: hand.tiles.slice(),
    packs: hand.packs.slice(),
    winningTile: hand.winningTile ?? null,
    flowers: hand.flowers.slice(),
    context: normalizeContext(hand.context, overrides),
    source: hand.source ?? (typeof input === "string" ? input : null)
  });
};

module.exports = {
  normalizeHandInput
};
