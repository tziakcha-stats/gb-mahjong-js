/* eslint-disable new-cap */
"use strict";

const {
  Fan,
  Handtiles,
  constants,
  judgeHu,
  judgeHuTile,
  calcTing,
  parseHand
} = require("../index");
const { tingCases } = require("../test-data/unit-test-cases");

const toSortedTileIds = tiles =>
  tiles
    .map(tile => tile.GetId())
    .slice()
    .sort((left, right) => left - right);
const mapNamesToValues = names =>
  names
    .map(name => constants[name])
    .slice()
    .sort((left, right) => left - right);

describe("Fan hu and ting", () => {
  test("calculates ting tiles for thirteen orphans shape", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("19m19s19pESWNCFP ");
    const fan = new Fan();

    expect(toSortedTileIds(fan.CalcTing(handtiles))).toEqual(
      mapNamesToValues([
        "TILE_1m",
        "TILE_1p",
        "TILE_1s",
        "TILE_9m",
        "TILE_9p",
        "TILE_9s",
        "TILE_E",
        "TILE_S",
        "TILE_W",
        "TILE_N",
        "TILE_C",
        "TILE_F",
        "TILE_P"
      ])
    );
  });

  test("judges hu for a complete hand and rejects an incomplete one", () => {
    const complete = new Handtiles();
    complete.StringToHandtiles("[CCCC][FFFF][PPPP][NNNN]EE");
    const incomplete = new Handtiles();
    incomplete.StringToHandtiles("28m47s369pESWCCP ");
    const fan = new Fan();

    expect(fan.JudgeHu(complete)).toBe(1);
    expect(fan.JudgeHu(incomplete)).toBe(0);
  });

  test("pure js judgeHu recognizes the same complete and incomplete hands", () => {
    expect(judgeHu("[CCCC][FFFF][PPPP][NNNN]EE|EE0000|")).toBe(true);
    expect(judgeHu("28m47s369pESWCCP |EE0000|")).toBe(false);
  });

  test("pure js judgeHu routes qidui through special hu detection", () => {
    expect(judgeHu("EESSWWNNPPFFCC|EE1000")).toBe(true);
  });

  test("pure js judgeHuTile checks a candidate winning tile without mutating the original hand", () => {
    const hand = parseHand("19m19s19pESWNCFP ");

    expect(judgeHuTile(hand, constants.TILE_E)).toBe(true);
    expect(hand.winningTile).toBe(null);
    expect(hand.tiles).toHaveLength(13);
    expect(toSortedTileIds(hand.tiles)).toEqual(
      mapNamesToValues([
        "TILE_1m",
        "TILE_9m",
        "TILE_1s",
        "TILE_9s",
        "TILE_1p",
        "TILE_9p",
        "TILE_E",
        "TILE_S",
        "TILE_W",
        "TILE_N",
        "TILE_C",
        "TILE_F",
        "TILE_P"
      ])
    );
  });

  test("pure js calcTing returns sorted tile ids for thirteen orphans shape", () => {
    expect(toSortedTileIds(calcTing("19m19s19pESWNCFP |EE0000|"))).toEqual(
      mapNamesToValues([
        "TILE_1m",
        "TILE_1p",
        "TILE_1s",
        "TILE_9m",
        "TILE_9p",
        "TILE_9s",
        "TILE_E",
        "TILE_S",
        "TILE_W",
        "TILE_N",
        "TILE_C",
        "TILE_F",
        "TILE_P"
      ])
    );
  });

  test("JudgeHuTile resets the last tile slot back to invalid", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("19m19s19pESWNCFP ");
    const fan = new Fan();

    expect(fan.JudgeHuTile(handtiles, constants.TILE_E)).toBe(1);
    expect(handtiles.GetLastLipai().GetId()).toBe(constants.TILE_INVALID);
  });

  test.each(tingCases)("ting case $input", ({ input, expectedNames }) => {
    const handtiles = new Handtiles();
    const fan = new Fan();

    expect(handtiles.StringToHandtiles(input)).toBe(0);
    expect(toSortedTileIds(fan.CalcTing(handtiles))).toEqual(
      mapNamesToValues(expectedNames)
    );
  });

  test.each(tingCases)(
    "pure js ting case $input",
    ({ input, expectedNames }) => {
      expect(toSortedTileIds(calcTing(input))).toEqual(
        mapNamesToValues(expectedNames)
      );
    }
  );
});
