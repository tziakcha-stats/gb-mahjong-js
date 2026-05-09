"use strict";
/* eslint-disable new-cap */

const { Shanten } = require("../solver/shanten");
const Handtiles = require("../core/handtiles");

describe("GB-Mahjong-JS Test Cases", () => {
  test("test case 1: normal hand", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("23468m25s3888899p ");

    const result = Shanten.calcAll(handtiles, { modes: ["normal"] });

    expect(result.normal).toBe(2);
  });

  test("test case 2: seven pairs", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("11223344556677m ");

    const result = Shanten.calcAll(handtiles, { modes: ["qidui"] });

    expect(result.qidui).toBe(-1);
  });

  test("test case 3: thirteen orphans", () => {
    const handtiles = new Handtiles();
    handtiles.StringToHandtiles("19m19s19pESWNCFPP ");

    const result = Shanten.calcAll(handtiles, { modes: ["shisanyao"] });

    expect(result.shisanyao).toBe(-1);
  });
});
