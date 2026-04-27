/* eslint-disable camelcase, new-cap, complexity, no-negated-condition, padding-line-between-statements */
"use strict";

const constants = require("./constants");
const Pack = require("./pack");
const Tile = require("./tile");

const HANDTILES_REGEX = /^(\[([1-9]{3,4}[msp]|[ESWNCFP]{3,4})(,[123567])?\]|([ESWNCFPa-h]|[1-9]+[msp]))+(\|([ESWN]{2}[01]{4})(\|([a-h]{0,8}|[0-8]))?)?$/;

const compareTiles = (left, right) => left.GetId() - right.GetId();
const createCountTable = () => Array(constants.TILE_MAJIANG + 1).fill(0);
const isDigit = char => char >= "0" && char <= "9";
const isWindOrDragon = char => /[ESWNCFP]/.test(char);
const isSuitChar = char => /[msp]/.test(char);
const isFlowerChar = char =>
  char >= constants.TILE_CHAR_MEI && char <= constants.TILE_CHAR_DONG;
const tileIdOf = tile => (tile instanceof Tile ? tile.GetId() : tile);
const toTile = tile => (tile instanceof Tile ? tile.clone() : new Tile(tile));

class Handtiles {
  constructor() {
    this._ClearAndSetDefault();
  }

  FuluBitmap() {
    let bitmap = 0n;

    this.fulu.forEach(pack => {
      const middleTile = pack.GetMiddleTile();

      switch (pack.GetType()) {
        case constants.PACK_TYPE_SHUNZI:
          bitmap |= middleTile.GetBitmap();
          bitmap |= middleTile.Pred().GetBitmap();
          bitmap |= middleTile.Succ().GetBitmap();
          break;
        case constants.PACK_TYPE_KEZI:
        case constants.PACK_TYPE_GANG:
        case constants.PACK_TYPE_JIANG:
          bitmap |= middleTile.GetBitmap();
          break;
        default:
          break;
      }
    });

    return bitmap;
  }

  LipaiBitmap() {
    return this.lipai.reduce((bitmap, tile) => bitmap | tile.GetBitmap(), 0n);
  }

  LipaiTileCount(tile) {
    return this.lipai_table[tileIdOf(tile)] || 0;
  }

  FuluTileCount(tile) {
    return this.fulu_table[tileIdOf(tile)] || 0;
  }

  HandTileCount(tile) {
    return this.LipaiTileCount(tile) + this.FuluTileCount(tile);
  }

  HuapaiCount() {
    let count = 0;

    for (
      let index = constants.TILE_MEI;
      index <= constants.TILE_DONG;
      index += 1
    ) {
      count += this.huapai_table[index];
    }

    return count;
  }

  HandtilesToString() {
    let result = "";

    this.fulu.forEach(pack => {
      const middleTile = pack.GetMiddleTile();
      const tiles = pack.GetAllTile();

      result += "[";
      tiles.forEach(tile => {
        result += tile.TileChar();
      });
      if (middleTile.IsShu()) {
        result += middleTile.SuitChar();
      }
      if (pack.GetOffer()) {
        result += `,${pack.GetOffer()}`;
      }
      result += "]";
    });

    let previousWasNumberedTile = false;
    for (let index = 0; index < this.lipai.length; index += 1) {
      const tile = this.lipai[index];
      if (previousWasNumberedTile) {
        const isFourteenthTile = index + 1 + this.fulu.length * 3 === 14;
        const changedSuit =
          !tile.IsShu() || tile.Suit() !== this.lipai[index - 1].Suit();
        if (isFourteenthTile || changedSuit) {
          result += this.lipai[index - 1].SuitChar();
        }
      }

      previousWasNumberedTile = tile.IsShu();
      result += tile.TileChar();
    }

    if (previousWasNumberedTile) {
      result += this.GetLastLipai().SuitChar();
    }

    result += "|";
    result += new Tile(this.GetQuanfeng()).TileChar();
    result += new Tile(this.GetMenfeng()).TileChar();
    result += String(this.IsZimo());
    result += String(this.IsJuezhang());
    result += String(this.IsHaidi());
    result += String(this.IsGang());
    result += "|";
    this.huapai.forEach(tile => {
      result += tile.TileChar();
    });

    return result;
  }

  StringToHandtiles(input) {
    const source = input.replace(/ /g, "");
    if (!HANDTILES_REGEX.test(source)) {
      return -1;
    }

    this._ClearAndSetDefault();

    const charMap = {
      [constants.TILE_CHAR_WAN]: constants.TILE_1m,
      [constants.TILE_CHAR_TIAO]: constants.TILE_1s,
      [constants.TILE_CHAR_BING]: constants.TILE_1p,
      [constants.TILE_CHAR_E]: constants.TILE_E,
      [constants.TILE_CHAR_S]: constants.TILE_S,
      [constants.TILE_CHAR_W]: constants.TILE_W,
      [constants.TILE_CHAR_N]: constants.TILE_N,
      [constants.TILE_CHAR_C]: constants.TILE_C,
      [constants.TILE_CHAR_F]: constants.TILE_F,
      [constants.TILE_CHAR_P]: constants.TILE_P,
      [constants.TILE_CHAR_MEI]: constants.TILE_MEI
    };

    let part = 0;
    let is_fulu = false;
    let handle_offer = false;
    let offer = 0;
    let nums = "";
    let chars = "";
    let char_suit = "";

    for (const char of source) {
      if (char === "[") {
        is_fulu = true;
        continue;
      }

      if (char === "]") {
        const isChars = nums.length === 0;
        const tileCode = isChars
          ? charMap[chars[1]]
          : charMap[char_suit] - 1 + Number(nums[1]);
        const tiles = isChars ? chars : nums;
        const pack = new Pack(constants.PACK_TYPE_INVALID, new Tile(tileCode));

        if (tiles.length === 3) {
          if (!handle_offer) {
            offer = 1;
          }
          if (offer > 3) {
            return -2;
          }
          if (
            !isChars &&
            tiles[1] === String.fromCharCode(tiles.charCodeAt(0) + 1) &&
            tiles[1] === String.fromCharCode(tiles.charCodeAt(2) - 1)
          ) {
            pack.SetType(constants.PACK_TYPE_SHUNZI);
          } else if (tiles[1] === tiles[0] && tiles[1] === tiles[2]) {
            pack.SetType(constants.PACK_TYPE_KEZI);
          } else {
            return -3;
          }
        } else if (tiles.length === 4) {
          if (!handle_offer) {
            offer = 0;
          }
          if (
            tiles[1] === tiles[0] &&
            tiles[1] === tiles[2] &&
            tiles[1] === tiles[3]
          ) {
            pack.SetType(constants.PACK_TYPE_GANG);
          } else {
            return -4;
          }
        }

        pack.SetOffer(offer);
        this.fulu.push(pack);

        is_fulu = false;
        handle_offer = false;
        offer = 0;
        nums = "";
        chars = "";
        char_suit = "";
        continue;
      }

      if (char === ",") {
        handle_offer = true;
        continue;
      }

      if (isDigit(char)) {
        if (part === 0) {
          if (is_fulu) {
            if (!handle_offer) {
              nums += char;
            } else {
              offer = Number(char);
            }
          } else {
            nums += char;
          }
        } else if (part === 1) {
          nums += char;
        } else if (part === 2) {
          for (let index = 0; index < Number(char); index += 1) {
            this.huapai.push(
              new Tile(charMap[constants.TILE_CHAR_MEI] + index)
            );
          }
        }
        continue;
      }

      if (isWindOrDragon(char)) {
        if (part === 0) {
          if (is_fulu) {
            chars += char;
            char_suit = "z";
          } else {
            this.lipai.push(new Tile(charMap[char]));
          }
        } else if (part === 1) {
          chars += char;
        }
        continue;
      }

      if (isSuitChar(char)) {
        if (is_fulu) {
          char_suit = char;
        } else {
          for (const num of nums) {
            this.lipai.push(new Tile(charMap[char] - 1 + Number(num)));
          }
          nums = "";
        }
        continue;
      }

      if (char === "|") {
        part += 1;
        continue;
      }

      if (isFlowerChar(char)) {
        const tile = new Tile(
          charMap[constants.TILE_CHAR_MEI] +
            char.charCodeAt(0) -
            constants.TILE_CHAR_MEI.charCodeAt(0)
        );
        if (part === 0) {
          this.lipai.push(tile);
        } else if (part === 2) {
          this.huapai.push(tile);
        }
        continue;
      }

      return -999;
    }

    if (part >= 1) {
      this.SetQuanfeng(charMap[chars[0]]);
      this.SetMenfeng(charMap[chars[1]]);
      this.SetZimo(Number(nums[0]));
      this.SetJuezhang(Number(nums[1]));
      this.SetHaidi(Number(nums[2]));
      this.SetGang(Number(nums[3]));
    }

    if (this.fulu.length * 3 + this.lipai.length === 13) {
      this.lipai.push(new Tile(constants.TILE_INVALID));
    } else if (this.fulu.length * 3 + this.lipai.length !== 14) {
      return -5;
    }

    if (this._GenerateTable()) {
      return -6;
    }

    if (this.IsZimo()) {
      this.LastLipai().SetZimo();
    } else {
      this.LastLipai().SetChonghu();
    }

    if (this.IsGang()) {
      if (this.IsZimo()) {
        if (!this.fulu.some(pack => pack.IsGang())) {
          return -7;
        }
      } else if (
        this.IsHaidi() ||
        this.HandTileCount(this.GetLastLipai()) > 1
      ) {
        return -7;
      }
    }

    if (this.IsJuezhang() && this.LipaiTileCount(this.GetLastLipai()) > 1) {
      return -7;
    }

    this.SortLipaiWithoutLastOne();
    return 0;
  }

  DrawTile(tile) {
    this.SetLastLipai(tile);
    this.LastLipai().SetZimo();
  }

  SetTile(tile) {
    this.SetLastLipai(tile);
    this.LastLipai().SetChonghu();
  }

  DiscardTile() {
    const tile = new Tile(this.GetLastLipai().GetId());
    this.SetLastLipai(constants.TILE_INVALID);
    return tile;
  }

  SortLipaiWithoutLastOne() {
    if (this.lipai.length <= 1) {
      return;
    }

    const last = this.lipai[this.lipai.length - 1];
    const sorted = this.lipai.slice(0, -1).sort(compareTiles);
    this.lipai = [...sorted, last];
  }

  SortLipaiAll() {
    this.lipai.sort(compareTiles);
  }

  GetQuanfeng() {
    return this._quanfeng;
  }

  GetMenfeng() {
    return this._menfeng;
  }

  IsZimo() {
    return this._zimo;
  }

  IsJuezhang() {
    return this._juezhang;
  }

  IsHaidi() {
    return this._haidi;
  }

  IsGang() {
    return this._gang;
  }

  SetQuanfeng(value) {
    this._quanfeng = value;
  }

  SetMenfeng(value) {
    this._menfeng = value;
  }

  SetZimo(value) {
    this._zimo = value;
  }

  SetJuezhang(value) {
    this._juezhang = value;
  }

  SetHaidi(value) {
    this._haidi = value;
  }

  SetGang(value) {
    this._gang = value;
  }

  IsMenqing() {
    return this.fulu.every(pack => pack.IsAnshou());
  }

  IsTotallyFulu() {
    return this.fulu.length === 4 && this.fulu.every(pack => !pack.IsAnshou());
  }

  NoFulu() {
    return this.fulu.length === 0;
  }

  SetLastLipai(tile) {
    const nextTile = toTile(tile);

    if (this.lipai.length === 0) {
      this.lipai.push(nextTile);
      this.lipai_table[nextTile.GetId()] += 1;
      return;
    }

    const current = this.LastLipai();
    this.lipai_table[current.GetId()] -= 1;
    this.lipai[this.lipai.length - 1] = nextTile;
    this.lipai_table[nextTile.GetId()] += 1;
  }

  LastLipai() {
    return this.lipai[this.lipai.length - 1];
  }

  GetLastLipai() {
    return this.LastLipai();
  }

  _GenerateTable() {
    this.fulu_table.fill(0);
    this.lipai_table.fill(0);
    this.huapai_table.fill(0);

    this.fulu.forEach(pack => {
      pack.GetAllTile().forEach(tile => {
        this.fulu_table[tile.GetId()] += 1;
      });
    });
    this.lipai.forEach(tile => {
      this.lipai_table[tile.GetId()] += 1;
    });
    this.huapai.forEach(tile => {
      this.huapai_table[tile.GetId()] += 1;
    });

    for (
      let index = constants.TILE_1m;
      index < constants.TILE_SIZE;
      index += 1
    ) {
      if (this.fulu_table[index] + this.lipai_table[index] > 4) {
        return -1;
      }
    }

    for (
      let index = constants.TILE_MEI;
      index <= constants.TILE_DONG;
      index += 1
    ) {
      if (this.lipai_table[index] + this.huapai_table[index] > 1) {
        return -1;
      }
    }

    return 0;
  }

  _ClearAndSetDefault() {
    this.fulu = [];
    this.lipai = [];
    this.huapai = [];
    this.fulu_table = createCountTable();
    this.lipai_table = createCountTable();
    this.huapai_table = createCountTable();
    this.SetQuanfeng(constants.TILE_E);
    this.SetMenfeng(constants.TILE_E);
    this.SetZimo(0);
    this.SetJuezhang(0);
    this.SetHaidi(0);
    this.SetGang(0);
  }
}

module.exports = Handtiles;
