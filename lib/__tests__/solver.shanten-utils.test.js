/* eslint-disable new-cap */
const {
  sizeUT,
  SeqCheck,
  toTestIndex,
  fromTestIndex,
  prepareStep,
  kernelStep,
  searchDp
} = require("../solver/shanten/utils");

describe("SeqCheck", () => {
  test("returns 1 for sequence-valid indices 0-6, 9-15, 18-24", () => {
    for (const i of [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      18,
      19,
      20,
      21,
      22,
      23,
      24
    ]) {
      expect(SeqCheck(i)).toBe(1);
    }
  });

  test("returns 0 or false for non-sequence indices", () => {
    expect(SeqCheck(7)).toBe(0);
    expect(SeqCheck(8)).toBe(0);
    expect(SeqCheck(25)).toBe(0);
    expect(SeqCheck(33)).toBe(0);
    expect(SeqCheck(-1)).toBe(false);
    expect(SeqCheck(sizeUT)).toBe(false);
  });
});

describe("toTestIndex / fromTestIndex roundtrip", () => {
  test("converts tile ids 1-34 and back", () => {
    for (let id = 1; id <= 34; id++) {
      const idx = toTestIndex(id);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(idx).toBeLessThan(sizeUT);
      expect(fromTestIndex(idx)).toBe(id);
    }
  });
});

describe("kernelStep", () => {
  test("does not produce NaN when i reaches last index", () => {
    const tiles = Array(51).fill(0);
    tiles[0] = 3;
    tiles[1] = 1;
    tiles[9] = 2;
    const guse = Array(sizeUT).fill(Infinity);
    guse[0] = 0;
    guse[1] = 0;
    guse[9] = 0;

    prepareStep(4, 1, tiles);
    const result = kernelStep(tiles, 0, 0, 4, 1, Infinity, Infinity, guse, 33);
    expect(Number.isNaN(result)).toBe(false);
  });
});

describe("searchDp", () => {
  test("returns a numeric shanten value for a simple hand", () => {
    const tiles = Array(51).fill(0);
    tiles[0] = 2;
    tiles[1] = 1;
    tiles[2] = 1;
    tiles[3] = 1;
    tiles[9] = 2;
    tiles[10] = 1;
    tiles[11] = 1;
    tiles[12] = 1;
    tiles[18] = 2;
    tiles[19] = 1;
    tiles[20] = 1;
    tiles[27] = 1;
    const tcnt = 14;

    const result = searchDp(tiles, 0, 0, tcnt);
    expect(typeof result).toBe("number");
    expect(Number.isNaN(result)).toBe(false);
    expect(result).toBeLessThanOrEqual(8);
  });

  test("returns -1 for a complete hand (tenpai)", () => {
    const tiles = Array(51).fill(0);
    tiles[0] = 2;
    tiles[1] = 3;
    tiles[2] = 3;
    tiles[3] = 3;
    tiles[9] = 1;
    tiles[10] = 1;
    tiles[11] = 1;
    tiles[18] = 1;
    tiles[19] = 1;
    tiles[20] = 1;
    const tcnt = 14;

    const result = searchDp(tiles, 0, 0, tcnt);
    expect(result).toBe(-1);
  });
});
