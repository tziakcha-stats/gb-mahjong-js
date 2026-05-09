"use strict";
/* eslint-disable new-cap */

const { PairStep, Step } = require("../solver/shanten/qidui");
const { sizeAT, JokerC } = require("../solver/shanten/utils");

describe("Shanten Qidui", () => {
  test("should return 0 for tenpai hand (6 complete pairs + 1 single)", () => {
    const tiles = Array(sizeAT).fill(0);
    tiles[0] = 2; // 1m x2
    tiles[1] = 2; // 2m x2
    tiles[2] = 2; // 3m x2
    tiles[3] = 2; // 4m x2
    tiles[4] = 2; // 5m x2
    tiles[5] = 2; // 6m x2
    tiles[6] = 1; // 7m x1

    expect(PairStep(tiles)).toBe(0);
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

  test("should return 13 for empty hand", () => {
    const tiles = Array(sizeAT).fill(0);

    expect(PairStep(tiles)).toBe(13);
  });

  test("should handle hand with joker tiles", () => {
    const tiles = Array(sizeAT).fill(0);
    tiles[0] = 2; // 1m x2
    tiles[1] = 2; // 2m x2
    tiles[2] = 2; // 3m x2
    tiles[3] = 2; // 4m x2
    tiles[4] = 2; // 5m x2
    tiles[5] = 2; // 6m x2
    tiles[JokerC] = 1; // 1 joker

    expect(PairStep(tiles)).toBe(0);
  });

  test("should handle multiple jokers substituting across incomplete pairs", () => {
    const tiles = Array(sizeAT).fill(0);
    tiles[0] = 2; // 1m x2
    tiles[1] = 2; // 2m x2
    tiles[2] = 2; // 3m x2
    tiles[3] = 2; // 4m x2
    tiles[6] = 1; // 7m x1
    tiles[8] = 1; // 9m x1
    tiles[10] = 1; // 1s x1
    tiles[12] = 1; // 2s x1
    tiles[JokerC] = 2; // 2 jokers

    expect(PairStep(tiles)).toBe(0);
  });

  test("should handle maximum pairs with duplicates", () => {
    const tiles = Array(sizeAT).fill(0);
    tiles[0] = 4; // 1m x4 (2 pairs)
    tiles[1] = 4; // 2m x4 (2 pairs)
    tiles[2] = 4; // 3m x4 (2 pairs)
    tiles[3] = 2; // 4m x2 (1 pair)

    expect(PairStep(tiles)).toBe(-1);
  });

  test("should return 6 for hand with 13 single tiles (no pairs)", () => {
    const tiles = Array(sizeAT).fill(0);
    tiles[0] = 1;
    tiles[2] = 1;
    tiles[4] = 1;
    tiles[6] = 1;
    tiles[8] = 1;
    tiles[10] = 1;
    tiles[12] = 1;
    tiles[14] = 1;
    tiles[16] = 1;
    tiles[18] = 1;
    tiles[20] = 1;
    tiles[22] = 1;
    tiles[24] = 1;

    expect(PairStep(tiles)).toBe(6);
  });

  test("should export Step as alias for PairStep with correct value", () => {
    const tiles = Array(sizeAT).fill(0);
    tiles[0] = 2;
    tiles[1] = 2;
    tiles[2] = 2;
    tiles[3] = 2;
    tiles[4] = 2;
    tiles[5] = 2;
    tiles[6] = 2;

    expect(Step(tiles)).toBe(-1);
    expect(Step(tiles)).toBe(PairStep(tiles));
  });
});
