"use strict";

const constants = require("../core/constants");
const {
  canonicalizeCandidate,
  createEmptyFanResult
} = require("../solver/fan-optimizer");

describe("fan optimizer", () => {
  test("canonicalizes decomposition packs by normalized signature", () => {
    const result = canonicalizeCandidate({
      totalFan: 88,
      fanIds: [constants.FAN_DASIXI],
      fans: [],
      decomposition: {
        packs: [
          { type: 2, tile: constants.TILE_W, offer: 0, zuhelong: 0 },
          { type: 2, tile: constants.TILE_E, offer: 2, zuhelong: 0 }
        ]
      }
    });

    expect(result.decomposition.packs[0]).toEqual(
      expect.objectContaining({ tile: constants.TILE_E })
    );
    expect(result.decomposition.packs[1]).toEqual(
      expect.objectContaining({ tile: constants.TILE_W })
    );
  });

  test("canonicalization remaps matchedPacks to the normalized pack order", () => {
    const result = canonicalizeCandidate({
      totalFan: 88,
      fanIds: [constants.FAN_DASIXI],
      fans: [
        {
          fanId: constants.FAN_DASIXI,
          score: 88,
          matchedPacks: [1]
        }
      ],
      decomposition: {
        packs: [
          { type: 2, tile: constants.TILE_W, offer: 0, zuhelong: 0 },
          { type: 2, tile: constants.TILE_E, offer: 2, zuhelong: 0 }
        ]
      }
    });

    expect(result.fans[0].matchedPacks).toEqual([0]);
  });

  test("returns empty canonical result when hand is not hu", () => {
    expect(createEmptyFanResult()).toEqual({
      isHu: false,
      totalFan: 0,
      fanIds: [],
      fans: [],
      decomposition: null
    });
  });
});
