/* eslint-disable new-cap */
"use strict";

const { parseHand, judgeHu, constants } = require("../index");
const { enumerateDecompositions } = require("../solver/decomposition");

const toPackSignature = packs =>
  packs.map(pack => ({
    offer: pack.offer,
    tile: pack.tile.GetId(),
    type: pack.type
  }));

test("enumerates a complete decomposition structure for a basic winning hand", () => {
  const hand = parseHand("[EEE,2][SSSS,1]WWWNN55pN|EE1000");
  const decompositions = enumerateDecompositions(hand);

  expect(decompositions).toHaveLength(1);
  expect(decompositions[0]).toHaveLength(5);
  expect(toPackSignature(decompositions[0])).toEqual([
    { type: constants.PACK_TYPE_KEZI, tile: constants.TILE_E, offer: 2 },
    { type: constants.PACK_TYPE_GANG, tile: constants.TILE_S, offer: 1 },
    { type: constants.PACK_TYPE_JIANG, tile: constants.TILE_5p, offer: 0 },
    { type: constants.PACK_TYPE_KEZI, tile: constants.TILE_W, offer: 0 },
    { type: constants.PACK_TYPE_KEZI, tile: constants.TILE_N, offer: 0 }
  ]);
});

test("judgeHu returns true for known winning hands", () => {
  expect(judgeHu("[EEE,2][SSSS,1]WWWNN55pN|EE1000")).toBe(true);
});

test("returns no decomposition and no hu for an incomplete hand", () => {
  const hand = parseHand("123m123p123s77z99m|EE0000");

  expect(enumerateDecompositions(hand)).toEqual([]);
  expect(judgeHu(hand)).toBe(false);
});
