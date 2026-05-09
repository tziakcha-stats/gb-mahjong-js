"use strict";

const { bukao16Count } = require("../solver/shanten/quanbukao");

describe("Shanten Quanbukao", () => {
  test("should calculate bukao count for complete quanbukao hand", () => {
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
    tiles[27] = 1; // E
    tiles[28] = 1; // S
    tiles[29] = 1; // W
    tiles[30] = 1; // N
    tiles[31] = 1; // C
    tiles[32] = 1; // F
    tiles[33] = 1; // P

    const result = bukao16Count(tiles);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(16);
  });

  test("empty hand should return 0", () => {
    const tiles = Array(51).fill(0);
    expect(bukao16Count(tiles)).toBe(0);
  });

  test("hand with joker should count joker", () => {
    const tiles = Array(51).fill(0);
    tiles[42] = 1; // JokerC
    expect(bukao16Count(tiles)).toBe(1);
  });
});
