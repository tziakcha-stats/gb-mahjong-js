"use strict";
/* eslint-disable new-cap */

const { KnitDragonStep } = require("../solver/shanten/zuhelong");

describe("Shanten Zuhelong", () => {
  test("should calculate shanten for knitted dragon", () => {
    const tiles = Array(51).fill(0);
    tiles[0] = 1; // 1m
    tiles[3] = 1; // 4m
    tiles[6] = 1; // 7m
    tiles[10] = 1; // 2s
    tiles[13] = 1; // 5s
    tiles[16] = 1; // 8s
    tiles[20] = 1; // 3p
    tiles[23] = 1; // 6p
    tiles[26] = 1; // 9p

    const result = KnitDragonStep(tiles, 9);
    expect(result).toBeGreaterThanOrEqual(-1);
    expect(result).toBeLessThanOrEqual(9);
  });
});
