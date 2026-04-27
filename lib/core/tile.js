/* eslint-disable new-cap */
/* global BigInt */
"use strict";

const constants = require("./constants");

class Tile {
  constructor(tile = constants.TILE_INVALID, drawflag = 0) {
    this._tile = tile;
    this._drawflag = drawflag;
  }

  assign(tile) {
    this._tile = tile;
    this.ResetDrawflag();
    return this;
  }

  clone() {
    return new Tile(this._tile, this._drawflag);
  }

  equals(tile) {
    if (tile instanceof Tile) {
      return this._tile === tile._tile;
    }

    return this._tile === tile;
  }

  Pred() {
    return new Tile(this._tile - 1);
  }

  Succ() {
    return new Tile(this._tile + 1);
  }

  GetTileUsingOffset(offset) {
    return new Tile(this._tile + offset);
  }

  Suit() {
    return constants.TILES_SUIT[this._tile];
  }

  Rank() {
    return constants.TILES_RANK[this._tile];
  }

  IsShu() {
    return (
      (this.GetBitmap() & constants.TILE_TYPE_BITMAP_SHU) === this.GetBitmap()
    );
  }

  IsZi() {
    return (
      (this.GetBitmap() & constants.TILE_TYPE_BITMAP_ZI) === this.GetBitmap()
    );
  }

  IsFeng() {
    return (
      (this.GetBitmap() & constants.TILE_TYPE_BITMAP_FENG) === this.GetBitmap()
    );
  }

  IsJian() {
    return (
      (this.GetBitmap() & constants.TILE_TYPE_BITMAP_JIAN) === this.GetBitmap()
    );
  }

  IsYaojiu() {
    return (
      (this.GetBitmap() & constants.TILE_TYPE_BITMAP_YAOJIU) ===
      this.GetBitmap()
    );
  }

  IsHua() {
    return this.Suit() === constants.SUIT_HUA;
  }

  UTF8() {
    return constants.TILES_UTF8[this._tile];
  }

  RankChar() {
    return String(this.Rank());
  }

  SuitChar() {
    return constants.TILES_SUIT_CHAR[this._tile];
  }

  TileChar() {
    return this.IsShu() ? this.RankChar() : this.SuitChar();
  }

  SetZimo() {
    this._drawflag = 1;
  }

  SetChonghu() {
    this._drawflag = 2;
  }

  ResetDrawflag() {
    this._drawflag = 0;
  }

  IsZimo() {
    return this._drawflag === 1;
  }

  IsChonghu() {
    return this._drawflag === 2;
  }

  GetId() {
    return this._tile;
  }

  GetBitmap() {
    return 1n << BigInt(this._tile);
  }

  GetDrawflag() {
    return this._drawflag;
  }

  valueOf() {
    return this._tile;
  }
}

module.exports = Tile;
