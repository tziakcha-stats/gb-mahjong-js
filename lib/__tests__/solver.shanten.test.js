"use strict";
/* eslint-disable new-cap */

const { Shanten } = require("../solver/shanten");
const Handtiles = require("../core/handtiles");

describe("Shanten Calculator", () => {
  test("should calculate shanten for normal hand (14-tile input)", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("23468m25s3888899p ");

    const result = Shanten.calcAll(handtiles, { modes: ["normal"] });

    expect(result.normal).toBe(2);
    expect(result.qidui).toBe(Infinity);
    expect(result.shisanyao).toBe(Infinity);
    expect(result.quanbukao).toBe(Infinity);
    expect(result.zuhelong).toBe(Infinity);
  });

  test("should calculate shanten for all patterns", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("23468m25s3888899p ");

    const result = Shanten.calcAll(handtiles);

    expect(result.normal).toBe(2);
    expect(result.qidui).toBe(3);
    expect(result.shisanyao).toBe(11);
  });

  test("should handle 14-tile tenpai hand", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("123m456p789s1122m");

    const result = Shanten.calcAll(handtiles);

    expect(result.normal).toBe(0);
  });

  test("should return -1 for winning hand", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("EEESSSWWWNNNCC");

    const result = Shanten.calcAll(handtiles);

    expect(result.normal).toBe(-1);
  });

  test("should return -1 and 13 for empty hand (0 tiles)", () => {
    const handtiles = new Handtiles();

    const result = Shanten.calcAll(handtiles);

    expect(result.normal).toBe(-1);
    expect(result.qidui).toBe(13);
  });

  test("should calculate shanten for hand with fulu", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("[EEE][SSS]123m456p78s");

    const result = Shanten.calcAll(handtiles);

    expect(result.normal).toBe(0);
    expect(result.qidui).toBe(Infinity);
    expect(result.shisanyao).toBe(Infinity);
    expect(result.quanbukao).toBe(Infinity);
  });

  test("should calculate shanten for honor-only hand", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("EESSSWWWNNNCC");

    const result = Shanten.calcAll(handtiles);

    expect(result.normal).toBe(0);
  });
});
