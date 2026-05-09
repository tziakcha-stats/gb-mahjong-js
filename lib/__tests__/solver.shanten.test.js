"use strict";
/* eslint-disable new-cap */

const { Shanten } = require("../solver/shanten");
const Handtiles = require("../core/handtiles");

describe("Shanten Calculator", () => {
  test("should calculate shanten for normal hand", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("23468m25s3888899p ");

    const result = Shanten.calcAll(handtiles, { modes: ["normal"] });

    expect(result.normal).toBeGreaterThanOrEqual(-1);
    expect(result.normal).toBeLessThanOrEqual(13);
    expect(result.qidui).toBe(Infinity);
    expect(result.shisanyao).toBe(Infinity);
    expect(result.quanbukao).toBe(Infinity);
    expect(result.zuhelong).toBe(Infinity);
  });

  test("should calculate shanten for all patterns", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("23468m25s3888899p ");

    const result = Shanten.calcAll(handtiles);

    expect(result.normal).toBeGreaterThanOrEqual(-1);
    expect(result.qidui).toBeGreaterThanOrEqual(-1);
    expect(result.shisanyao).toBeGreaterThanOrEqual(-1);
  });

  test("should handle 14 tiles", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("23468m25s3888899p3m");

    const result = Shanten.calcAll(handtiles);

    expect(result.normal).toBeGreaterThanOrEqual(-1);
  });
});
