const { Pack, Tile, constants } = require("../index");

test("exports compatibility core", () => {
  expect(typeof Tile).toBe("function");
  expect(typeof Pack).toBe("function");
  expect(constants.TILE_1m).toBe(1);
});

test("exports named constants alongside grouped constants", () => {
  expect(constants.SUIT_TIAO).toBe(2);
  expect(constants.PACK_TYPE_SHUNZI).toBe(1);
});
