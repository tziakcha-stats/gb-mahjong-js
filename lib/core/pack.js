/* eslint-disable camelcase, new-cap */
"use strict";

const constants = require("./constants");
const Tile = require("./tile");

class Pack {
  constructor(
    type = constants.PACK_TYPE_INVALID,
    tile = new Tile(),
    zuhelongType = 0,
    offer = 0
  ) {
    this._type = type;
    this._tile = tile;
    this._zuhelong_type = zuhelongType;
    this._offer = offer;
  }

  IsValid() {
    return this._type !== constants.PACK_TYPE_INVALID;
  }

  GetType() {
    return this._type;
  }

  GetMiddleTile() {
    return this._tile;
  }

  equals(pack) {
    return this._type === pack._type && this._tile.equals(pack._tile);
  }

  GetAllTile() {
    const ret = [];

    switch (this.GetType()) {
      case constants.PACK_TYPE_SHUNZI:
        ret.push(this._tile.Pred(), this._tile.clone(), this._tile.Succ());
        break;
      case constants.PACK_TYPE_GANG:
        ret.push(
          this._tile.clone(),
          this._tile.clone(),
          this._tile.clone(),
          this._tile.clone()
        );
        break;
      case constants.PACK_TYPE_KEZI:
        ret.push(this._tile.clone(), this._tile.clone(), this._tile.clone());
        break;
      case constants.PACK_TYPE_JIANG:
        ret.push(this._tile.clone(), this._tile.clone());
        break;
      case constants.PACK_TYPE_ZUHELONG:
        for (
          let index = constants.TILE_1m;
          index <= constants.TILE_9p;
          index += 1
        ) {
          if ((constants.BITMAP(index) & this.GetZuhelongBitmap()) !== 0n) {
            ret.push(new Tile(index));
          }
        }

        break;
      default:
        break;
    }

    return ret;
  }

  GetZuhelongType() {
    return this._zuhelong_type;
  }

  GetZuhelongBitmap() {
    return constants.ZuhelongBitmap[this._zuhelong_type];
  }

  GetOffer() {
    return this._offer;
  }

  IsAnshou() {
    return this._offer === 0 || this._offer === -1;
  }

  HaveLastTile() {
    return this._offer < 0;
  }

  IsShunzi() {
    return this._type === constants.PACK_TYPE_SHUNZI;
  }

  IsKezi() {
    return this._type === constants.PACK_TYPE_KEZI;
  }

  IsGang() {
    return this._type === constants.PACK_TYPE_GANG;
  }

  IsKeGang() {
    return this.IsKezi() || this.IsGang();
  }

  IsJiang() {
    return this._type === constants.PACK_TYPE_JIANG;
  }

  IsZuhelong() {
    return this._type === constants.PACK_TYPE_ZUHELONG;
  }

  SetOffer(offer) {
    this._offer = offer;
  }

  SetType(type) {
    this._type = type;
  }
}

module.exports = Pack;
