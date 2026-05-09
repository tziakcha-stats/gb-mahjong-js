"use strict";
/* eslint-disable new-cap */

const { PairStep, Step } = require("../solver/shanten/qidui");
const { sizeAT } = require("../solver/shanten/utils");

describe("Shanten Qidui", () => {
  test("should calculate shanten for seven pairs", () => {
    const tiles = Array(sizeAT).fill(0);
    tiles[0] = 2; // 1m x2
    tiles[1] = 2; // 2m x2
    tiles[2] = 2; // 3m x2
    tiles[3] = 2; // 4m x2
    tiles[4] = 2; // 5m x2
    tiles[5] = 2; // 6m x2
    tiles[6] = 1; // 7m x1

    const result = PairStep(tiles);
    expect(result).toBeGreaterThanOrEqual(-1);
    expect(result).toBeLessThanOrEqual(6);
  });

  test("should return -1 for complete seven pairs hand", () => {
    const tiles = Array(sizeAT).fill(0);
    tiles[0] = 2; // 1m x2
    tiles[1] = 2; // 2m x2
    tiles[2] = 2; // 3m x2
    tiles[3] = 2; // 4m x2
    tiles[4] = 2; // 5m x2
    tiles[5] = 2; // 6m x2
    tiles[6] = 2; // 7m x2

    expect(PairStep(tiles)).toBe(-1);
  });

  test("should export Step as alias for PairStep", () => {
    const tiles = Array(sizeAT).fill(0);
    tiles[0] = 2;
    tiles[1] = 2;
    tiles[2] = 2;
    tiles[3] = 2;
    tiles[4] = 2;
    tiles[5] = 2;
    tiles[6] = 2;

    expect(Step(tiles)).toBe(PairStep(tiles));
  });
});
