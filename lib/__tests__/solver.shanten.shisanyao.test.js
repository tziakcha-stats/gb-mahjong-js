"use strict";
/* eslint-disable new-cap */

const { OrphanStep } = require("../solver/shanten/shisanyao");

describe("Shanten Shisanyao", () => {
  test("complete thirteen orphans hand should be tenpai", () => {
    const tiles = Array(51).fill(0);
    tiles[0] = 1; // 1m
    tiles[8] = 1; // 9m
    tiles[9] = 1; // 1s
    tiles[17] = 1; // 9s
    tiles[18] = 1; // 1p
    tiles[26] = 1; // 9p
    tiles[27] = 1; // E
    tiles[28] = 1; // S
    tiles[29] = 1; // W
    tiles[30] = 1; // N
    tiles[31] = 1; // C
    tiles[32] = 1; // F
    tiles[33] = 1; // P

    expect(OrphanStep(tiles)).toBe(0);
  });

  test("complete thirteen orphans (pair + 12 singletons) should be -1", () => {
    const tiles = Array(51).fill(0);
    tiles[0] = 2; // 1m (pair)
    tiles[8] = 1; // 9m
    tiles[9] = 1; // 1s
    tiles[17] = 1; // 9s
    tiles[18] = 1; // 1p
    tiles[26] = 1; // 9p
    tiles[27] = 1; // E
    tiles[28] = 1; // S
    tiles[29] = 1; // W
    tiles[30] = 1; // N
    tiles[31] = 1; // C
    tiles[32] = 1; // F
    tiles[33] = 1; // P

    expect(OrphanStep(tiles)).toBe(-1);
  });

  test("all 13 orphan tiles should be 0-shanten (tenpai, needs pair)", () => {
    const tiles = Array(51).fill(0);
    tiles[0] = 1; // 1m
    tiles[8] = 1; // 9m
    tiles[9] = 1; // 1s
    tiles[17] = 1; // 9s
    tiles[18] = 1; // 1p
    tiles[26] = 1; // 9p
    tiles[27] = 1; // E
    tiles[28] = 1; // S
    tiles[29] = 1; // W
    tiles[30] = 1; // N
    tiles[31] = 1; // C
    tiles[32] = 1; // F
    tiles[33] = 1; // P

    expect(OrphanStep(tiles)).toBe(0);
  });

  test("missing one orphan tile should be 1-shanten", () => {
    const tiles = Array(51).fill(0);
    tiles[0] = 1; // 1m
    tiles[8] = 1; // 9m
    tiles[9] = 1; // 1s
    tiles[17] = 1; // 9s
    tiles[18] = 1; // 1p
    tiles[26] = 1; // 9p
    tiles[27] = 1; // E
    tiles[28] = 1; // S
    tiles[29] = 1; // W
    tiles[30] = 1; // N
    tiles[31] = 1; // C
    tiles[32] = 1; // F
    // missing 33 (P)

    expect(OrphanStep(tiles)).toBe(1);
  });

  test("empty hand should be 13-shanten for thirteen orphans", () => {
    const tiles = Array(51).fill(0);
    expect(OrphanStep(tiles)).toBe(13);
  });
});
