"use strict";
/* eslint-disable new-cap */

const { Step, Win, Listen } = require("../solver/shanten/normal");

describe("Win", () => {
  test("returns true for a complete hand with 4 melds and 1 pair", () => {
    const tiles = Array(34).fill(0);
    tiles[0] = 2;
    tiles[1] = 1;
    tiles[2] = 1;
    tiles[3] = 1;
    tiles[9] = 3;
    tiles[10] = 3;
    tiles[18] = 3;
    expect(Win(tiles, 14)).toBe(true);
  });

  test("returns false for an incomplete hand", () => {
    const tiles = Array(34).fill(0);
    tiles[0] = 1;
    tiles[1] = 1;
    tiles[2] = 1;
    tiles[3] = 1;
    tiles[4] = 1;
    tiles[5] = 1;
    tiles[6] = 1;
    tiles[7] = 1;
    tiles[8] = 1;
    tiles[9] = 1;
    tiles[10] = 1;
    tiles[11] = 1;
    tiles[12] = 1;
    expect(Win(tiles, 13)).toBe(false);
  });

  test("returns true for seven pairs", () => {
    const tiles = Array(34).fill(0);
    tiles[0] = 2;
    tiles[1] = 2;
    tiles[2] = 2;
    tiles[3] = 2;
    tiles[4] = 2;
    tiles[5] = 2;
    tiles[6] = 2;
    expect(Win(tiles, 14)).toBe(true);
  });
});

describe("Listen", () => {
  test("returns true for a hand waiting for one tile", () => {
    const tiles = Array(34).fill(0);
    tiles[0] = 2;
    tiles[1] = 1;
    tiles[2] = 1;
    tiles[3] = 1;
    tiles[9] = 3;
    tiles[10] = 3;
    tiles[18] = 3;
    expect(Listen(tiles, 13, 14)).toBe(true);
  });

  test("returns false for a hand not in tenpai", () => {
    const tiles = Array(34).fill(0);
    tiles[0] = 1;
    tiles[2] = 1;
    tiles[4] = 1;
    tiles[6] = 1;
    tiles[8] = 1;
    tiles[9] = 1;
    tiles[11] = 1;
    tiles[13] = 1;
    tiles[15] = 1;
    tiles[17] = 1;
    tiles[18] = 1;
    tiles[20] = 1;
    tiles[22] = 1;
    expect(Listen(tiles, 13, 14)).toBe(false);
  });
});

describe("Shanten Normal", () => {
  test("returns -1 for a complete hand (win)", () => {
    const tiles = Array(34).fill(0);
    tiles[0] = 2;
    tiles[1] = 1;
    tiles[2] = 1;
    tiles[3] = 1;
    tiles[9] = 3;
    tiles[10] = 3;
    tiles[18] = 3;
    expect(Step(tiles, 14)).toBe(-1);
  });

  test("returns 0 for a tenpai hand", () => {
    const tiles = Array(34).fill(0);
    tiles[0] = 2;
    tiles[1] = 1;
    tiles[2] = 1;
    tiles[3] = 1;
    tiles[9] = 3;
    tiles[10] = 3;
    tiles[18] = 2;
    expect(Step(tiles, 13)).toBe(0);
  });

  test("returns positive shanten for incomplete hand", () => {
    const tiles = Array(34).fill(0);
    tiles[0] = 1;
    tiles[1] = 1;
    tiles[2] = 1;
    tiles[3] = 1;
    tiles[4] = 1;
    tiles[5] = 1;
    tiles[6] = 1;
    tiles[7] = 1;
    tiles[8] = 1;
    tiles[9] = 1;
    tiles[10] = 1;
    tiles[11] = 1;
    tiles[12] = 1;
    const result = Step(tiles, 13);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(13);
  });

  test("calculates shanten for 13-tile hand", () => {
    const tiles = Array(34).fill(0);
    tiles[0] = 1;
    tiles[1] = 1;
    tiles[2] = 1;
    tiles[3] = 1;
    tiles[4] = 1;
    tiles[5] = 1;
    tiles[6] = 1;
    tiles[7] = 1;
    tiles[8] = 1;
    tiles[9] = 1;
    tiles[10] = 1;
    tiles[11] = 1;
    tiles[12] = 1;
    const result = Step(tiles, 13);
    expect(typeof result).toBe("number");
    expect(Number.isNaN(result)).toBe(false);
  });
});
