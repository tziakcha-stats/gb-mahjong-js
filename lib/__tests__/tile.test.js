/* eslint-disable new-cap */
/* global BigInt */
const { Pack, Tile, constants } = require("../index");

describe("Tile", () => {
  test("tile exposes suit, rank, and draw flags", () => {
    const tile = new Tile(constants.TILE_5s);

    expect(tile.Suit()).toBe(constants.SUIT_TIAO);
    expect(tile.Rank()).toBe(constants.RANK_5);

    tile.SetZimo();
    expect(tile.IsZimo()).toBe(true);
  });

  test("tile exposes bitmap and character helpers", () => {
    const tile = new Tile(constants.TILE_E);

    expect(tile.GetId()).toBe(constants.TILE_E);
    expect(tile.GetBitmap()).toBe(1n << BigInt(constants.TILE_E));
    expect(tile.SuitChar()).toBe(constants.TILE_CHAR_E);
    expect(tile.TileChar()).toBe(constants.TILE_CHAR_E);
  });
});

describe("Pack", () => {
  test("pack expands shunzi and tracks offer flags", () => {
    const pack = new Pack(
      constants.PACK_TYPE_SHUNZI,
      new Tile(constants.TILE_5s),
      0,
      -1
    );

    expect(pack.IsShunzi()).toBe(true);
    expect(pack.IsAnshou()).toBe(true);
    expect(pack.HaveLastTile()).toBe(true);
    expect(pack.GetAllTile().map(tile => tile.GetId())).toEqual([
      constants.TILE_4s,
      constants.TILE_5s,
      constants.TILE_6s
    ]);
  });

  test("pack expands gang and zuhelong tiles", () => {
    const gang = new Pack(constants.PACK_TYPE_GANG, new Tile(constants.TILE_C));
    const zuhelong = new Pack(constants.PACK_TYPE_ZUHELONG, new Tile(), 1);

    expect(gang.IsKeGang()).toBe(true);
    expect(gang.GetAllTile().map(tile => tile.GetId())).toEqual([
      constants.TILE_C,
      constants.TILE_C,
      constants.TILE_C,
      constants.TILE_C
    ]);
    expect(zuhelong.GetAllTile().map(tile => tile.GetId())).toEqual([
      constants.TILE_1m,
      constants.TILE_4m,
      constants.TILE_7m,
      constants.TILE_2s,
      constants.TILE_5s,
      constants.TILE_8s,
      constants.TILE_3p,
      constants.TILE_6p,
      constants.TILE_9p
    ]);
  });
});
