/* eslint-disable new-cap */
/* global BigInt */
"use strict";

const constants = require("../core/constants");
const { normalizeHandInput } = require("../api/normalize-hand");
const { enumerateDecompositions } = require("./decomposition");
const {
  canonicalizeCandidate,
  createEmptyFanResult
} = require("./fan-optimizer");

// ── Tile helpers ──────────────────────────────────────────────────────────────
const tileIdOf = tile => {
  if (tile === null || tile === undefined) return 0;
  return typeof tile.GetId === "function" ? tile.GetId() : tile;
};

const isShu = tileId =>
  ((1n << BigInt(tileId)) & constants.TILE_TYPE_BITMAP_SHU) ===
  1n << BigInt(tileId);

const isZi = tileId =>
  ((1n << BigInt(tileId)) & constants.TILE_TYPE_BITMAP_ZI) ===
  1n << BigInt(tileId);

const isFeng = tileId =>
  tileId >= constants.TILE_E && tileId <= constants.TILE_N;

const isJian = tileId =>
  tileId >= constants.TILE_C && tileId <= constants.TILE_P;

const isHonorTile = tileId =>
  tileId >= constants.TILE_E && tileId <= constants.TILE_P;

const isNumberedTile = tileId =>
  tileId >= constants.TILE_1m && tileId <= constants.TILE_9p;

const isYaojiu = tileId =>
  ((1n << BigInt(tileId)) & constants.TILE_TYPE_BITMAP_YAOJIU) ===
  1n << BigInt(tileId);

const tileRank = tileId => constants.TILES_RANK[tileId];
const tileSuit = tileId => constants.TILES_SUIT[tileId];

// ── Pack helpers (support both Pack and DecompositionPack) ─────────────────────
const packType = pack =>
  typeof pack.GetType === "function" ? pack.GetType() : pack.type;
const packTile = pack =>
  typeof pack.GetMiddleTile === "function" ? pack.GetMiddleTile() : pack.tile;
const packOffer = pack =>
  typeof pack.GetOffer === "function" ? pack.GetOffer() : pack.offer;

const isKezi = pack => packType(pack) === constants.PACK_TYPE_KEZI;
const isGang = pack => packType(pack) === constants.PACK_TYPE_GANG;
const isKeGang = pack => isKezi(pack) || isGang(pack);
const isJiang = pack => packType(pack) === constants.PACK_TYPE_JIANG;
const isShunzi = pack => packType(pack) === constants.PACK_TYPE_SHUNZI;
const isAnshou = pack => {
  const offer = packOffer(pack);
  return offer === 0 || offer === -1;
};

const packTileId = pack => tileIdOf(packTile(pack));

const packsEqual = (a, b) =>
  packType(a) === packType(b) && packTileId(a) === packTileId(b);

// ── FanAccumulator ────────────────────────────────────────────────────────────
class FanAccumulator {
  constructor() {
    this.fanTable = new Map();
    this.excludedTable = new Map();
  }

  addFan(fanId, matchedPacks = []) {
    if (!this.fanTable.has(fanId)) {
      this.fanTable.set(fanId, []);
    }

    this.fanTable.get(fanId).push(matchedPacks.slice().sort((a, b) => a - b));
  }

  excludeFan(fanId, matchedPacks = []) {
    if (!this.excludedTable.has(fanId)) {
      this.excludedTable.set(fanId, []);
    }

    this.excludedTable
      .get(fanId)
      .push(matchedPacks.slice().sort((a, b) => a - b));
  }

  hasFan(fanId) {
    const entries = this.fanTable.get(fanId);
    return Boolean(entries) && entries.length > 0;
  }

  applyExclusions() {
    for (const [fanId, excludedEntries] of this.excludedTable) {
      const fanEntries = this.fanTable.get(fanId);
      if (!fanEntries || fanEntries.length === 0) continue;

      const used = new Array(excludedEntries.length).fill(false);
      const keep = new Array(fanEntries.length).fill(true);

      for (let j = 0; j < excludedEntries.length; j++) {
        if (used[j]) continue;
        for (let k = 0; k < fanEntries.length; k++) {
          if (!keep[k]) continue;
          if (arraysEqual(fanEntries[k], excludedEntries[j])) {
            keep[k] = false;
            used[j] = true;
            break;
          }
        }
      }

      const remaining = fanEntries.filter((_, i) => keep[i]);
      if (remaining.length === 0) {
        this.fanTable.delete(fanId);
      } else {
        this.fanTable.set(fanId, remaining);
      }
    }
  }

  getTotal() {
    let total = 0;
    for (const [fanId, entries] of this.fanTable) {
      total += entries.length * constants.FAN_SCORE[fanId];
    }

    return total;
  }

  getFanIds() {
    const ids = [];
    for (const [fanId, entries] of this.fanTable) {
      for (let i = 0; i < entries.length; i++) {
        ids.push(fanId);
      }
    }

    return ids.sort((a, b) => a - b);
  }

  getFans() {
    const fans = [];
    for (const [fanId, entries] of this.fanTable) {
      for (const matchedPacks of entries) {
        fans.push({
          fanId,
          score: constants.FAN_SCORE[fanId],
          matchedPacks
        });
      }
    }

    return fans;
  }

  clear() {
    this.fanTable.clear();
    this.excludedTable.clear();
  }
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}

// ── Bitmap helpers ────────────────────────────────────────────────────────────
const collectBitmap = packs => {
  let bitmap = 0n;
  for (const pack of packs) {
    if (!pack) continue;
    const tid = packTileId(pack);
    if (tid === null || tid === undefined) continue;
    if (isShunzi(pack)) {
      bitmap |= 1n << BigInt(tid - 1);
      bitmap |= 1n << BigInt(tid);
      bitmap |= 1n << BigInt(tid + 1);
    } else if (isGang(pack)) {
      bitmap |= 1n << BigInt(tid);
    } else if (isKezi(pack)) {
      bitmap |= 1n << BigInt(tid);
    } else if (isJiang(pack)) {
      bitmap |= 1n << BigInt(tid);
    }
  }

  return bitmap;
};

const collectTileBitmap = tiles => {
  let bitmap = 0n;
  for (const tile of tiles) {
    bitmap |= tile.GetBitmap();
  }

  return bitmap;
};

const handTileCount = (hand, tileId) => {
  let count = 0;
  for (const tile of hand.tiles) {
    if (tile.GetId() === tileId) count++;
  }

  for (const pack of hand.packs) {
    const type = packType(pack);
    const tid = packTileId(pack);
    if (type === constants.PACK_TYPE_SHUNZI) {
      if (tid - 1 === tileId || tid === tileId || tid + 1 === tileId) count++;
    } else if (type === constants.PACK_TYPE_KEZI) {
      if (tid === tileId) count += 3;
    } else if (type === constants.PACK_TYPE_GANG) {
      if (tid === tileId) count += 4;
    }
  }

  return count;
};

const isMenqing = hand =>
  hand.packs.length === 0 || hand.packs.every(p => isAnshou(p));

const bitPopCount = n => {
  let c = 0;
  let val = n;
  while (val) {
    val &= val - 1n;
    c++;
  }

  return c;
};

// ── countOverallAttrFans ──────────────────────────────────────────────────────
const excludeYaojiuke = (acc, packs) => {
  for (let i = 0; i < packs.length; i++) {
    const rank = tileRank(packTileId(packs[i]));
    const zi = isZi(packTileId(packs[i]));
    if (isKeGang(packs[i]) && (rank === 1 || rank === 9 || zi)) {
      acc.excludeFan(constants.FAN_YAOJIUKE, [i]);
    }
  }
};

const countOverallAttrFans = (acc, hand, packs, zuhelongType) => {
  let handBitmap = collectBitmap(hand.packs) | collectTileBitmap(hand.tiles);
  if (zuhelongType > 0) {
    handBitmap |= constants.ZuhelongBitmap[zuhelongType];
  }

  if (zuhelongType === 0) {
    // 绿一色
    if ((handBitmap & constants.TILE_TYPE_BITMAP_LV) === handBitmap) {
      acc.addFan(constants.FAN_LVYISE);
      acc.excludeFan(constants.FAN_HUNYISE);
    }

    // 九莲宝灯
    if (isMenqing(hand)) {
      const tileTable = new Map();
      for (const tile of hand.tiles) {
        const id = tile.GetId();
        tileTable.set(id, (tileTable.get(id) || 0) + 1);
      }

      const winTileId = hand.winningTile
        ? hand.winningTile.GetId()
        : hand.tiles[hand.tiles.length - 1].GetId();
      tileTable.set(winTileId, tileTable.get(winTileId) - 1);

      let startTile = -1;
      if (tileTable.get(constants.TILE_1m) > 0) startTile = constants.TILE_1m;
      else if (tileTable.get(constants.TILE_1s) > 0)
        startTile = constants.TILE_1s;
      else if (tileTable.get(constants.TILE_1p) > 0)
        startTile = constants.TILE_1p;

      if (startTile > 0) {
        let flag = true;
        if (
          tileTable.get(startTile) !== 3 ||
          tileTable.get(startTile + 8) !== 3
        ) {
          flag = false;
        }

        for (let i = 2; i <= 8; i++) {
          if (tileTable.get(startTile - 1 + i) !== 1) {
            flag = false;
            break;
          }
        }

        if (flag) {
          acc.addFan(constants.FAN_JIULIANBAODENG);
          acc.excludeFan(constants.FAN_QINGYISE);
          acc.excludeFan(constants.FAN_BUQIUREN);
          acc.excludeFan(constants.FAN_MENQIANQING);
          acc.excludeFan(constants.FAN_WUZI);
          for (let i = 0; i < packs.length; i++) {
            if (isKeGang(packs[i]) && isYaojiu(packTileId(packs[i]))) {
              acc.excludeFan(constants.FAN_YAOJIUKE, [i]);
              break;
            }
          }
        }
      }
    }

    // 清幺九
    if (
      (handBitmap &
        (constants.TILE_TYPE_BITMAP_YAOJIU &
          ~constants.TILE_TYPE_BITMAP_ZI)) ===
      handBitmap
    ) {
      acc.addFan(constants.FAN_QINGYAOJIU);
      acc.excludeFan(constants.FAN_PENGPENGHU);
      acc.excludeFan(constants.FAN_QUANDAIYAO);
      acc.excludeFan(constants.FAN_WUZI);
      for (let i = 0; i < packs.length; i++) {
        for (let j = i + 1; j < packs.length; j++) {
          if (
            isKeGang(packs[i]) &&
            isKeGang(packs[j]) &&
            tileRank(packTileId(packs[i])) === tileRank(packTileId(packs[j]))
          ) {
            acc.excludeFan(constants.FAN_SHUANGTONGKE, [i, j]);
          }
        }
      }

      excludeYaojiuke(acc, packs);
    }

    // 字一色
    if ((handBitmap & constants.TILE_TYPE_BITMAP_ZI) === handBitmap) {
      acc.addFan(constants.FAN_ZIYISE);
      acc.excludeFan(constants.FAN_PENGPENGHU);
      acc.excludeFan(constants.FAN_QUANDAIYAO);
      excludeYaojiuke(acc, packs);
    }

    // 混幺九
    if (
      handBitmap &
        constants.TILE_TYPE_BITMAP_YAOJIU &
        ~constants.TILE_TYPE_BITMAP_ZI &&
      handBitmap & constants.TILE_TYPE_BITMAP_ZI &&
      (handBitmap & constants.TILE_TYPE_BITMAP_YAOJIU) === handBitmap
    ) {
      acc.addFan(constants.FAN_HUNYAOJIU);
      acc.excludeFan(constants.FAN_PENGPENGHU);
      acc.excludeFan(constants.FAN_QUANDAIYAO);
      excludeYaojiuke(acc, packs);
    }

    // 全双刻
    if (packs.length === 5) {
      let flag = true;
      for (const p of packs) {
        if (
          !(
            (isKeGang(p) || isJiang(p)) &&
            isShu(packTileId(p)) &&
            tileRank(packTileId(p)) % 2 === 0
          )
        ) {
          flag = false;
          break;
        }
      }

      if (flag) {
        acc.addFan(constants.FAN_QUANSHUANGKE);
        acc.excludeFan(constants.FAN_PENGPENGHU);
        acc.excludeFan(constants.FAN_DUANYAO);
        acc.excludeFan(constants.FAN_WUZI);
      }
    }

    // 清一色
    if (
      (handBitmap & constants.TILE_TYPE_BITMAP_WAN) === handBitmap ||
      (handBitmap & constants.TILE_TYPE_BITMAP_TIAO) === handBitmap ||
      (handBitmap & constants.TILE_TYPE_BITMAP_BING) === handBitmap
    ) {
      acc.addFan(constants.FAN_QINGYISE);
      acc.excludeFan(constants.FAN_WUZI);
    }

    // 全大
    if ((handBitmap & constants.TILE_TYPE_BITMAP_QUANDA) === handBitmap) {
      acc.addFan(constants.FAN_QUANDA);
      acc.excludeFan(constants.FAN_DAYUWU);
      acc.excludeFan(constants.FAN_WUZI);
    }

    // 全中
    if ((handBitmap & constants.TILE_TYPE_BITMAP_QUANZHONG) === handBitmap) {
      acc.addFan(constants.FAN_QUANZHONG);
      acc.excludeFan(constants.FAN_DUANYAO);
      acc.excludeFan(constants.FAN_WUZI);
    }

    // 全小
    if ((handBitmap & constants.TILE_TYPE_BITMAP_QUANXIAO) === handBitmap) {
      acc.addFan(constants.FAN_QUANXIAO);
      acc.excludeFan(constants.FAN_XIAOYUWU);
      acc.excludeFan(constants.FAN_WUZI);
    }

    // 全带五
    if (packs.length === 5) {
      let flag = true;
      for (const p of packs) {
        const rank = tileRank(packTileId(p));
        if (
          !(
            (isShunzi(p) && rank >= 4 && rank <= 6) ||
            ((isKeGang(p) || isJiang(p)) && rank === 5)
          )
        ) {
          flag = false;
          break;
        }
      }

      if (flag) {
        acc.addFan(constants.FAN_QUANDAIWU);
        acc.excludeFan(constants.FAN_DUANYAO);
        acc.excludeFan(constants.FAN_WUZI);
      }
    }

    // 大于五
    if ((handBitmap & constants.TILE_TYPE_BITMAP_DAYUWU) === handBitmap) {
      acc.addFan(constants.FAN_DAYUWU);
      acc.excludeFan(constants.FAN_WUZI);
    }

    // 小于五
    if ((handBitmap & constants.TILE_TYPE_BITMAP_XIAOYUWU) === handBitmap) {
      acc.addFan(constants.FAN_XIAOYUWU);
      acc.excludeFan(constants.FAN_WUZI);
    }

    // 推不倒
    if ((handBitmap & constants.TILE_TYPE_BITMAP_TUIBUDAO) === handBitmap) {
      acc.addFan(constants.FAN_TUIBUDAO);
      acc.excludeFan(constants.FAN_QUEYIMEN);
    }

    // 碰碰和
    if (packs.length === 5 && packs.every(p => isKeGang(p) || isJiang(p))) {
      acc.addFan(constants.FAN_PENGPENGHU);
    }

    // 混一色
    {
      const bitmapNozi = handBitmap & ~constants.TILE_TYPE_BITMAP_ZI;
      if (
        handBitmap & constants.TILE_TYPE_BITMAP_ZI &&
        handBitmap & constants.TILE_TYPE_BITMAP_SHU &&
        ((bitmapNozi & constants.TILE_TYPE_BITMAP_WAN) === bitmapNozi ||
          (bitmapNozi & constants.TILE_TYPE_BITMAP_TIAO) === bitmapNozi ||
          (bitmapNozi & constants.TILE_TYPE_BITMAP_BING) === bitmapNozi)
      ) {
        acc.addFan(constants.FAN_HUNYISE);
      }
    }

    // 全带幺
    if (packs.length === 5) {
      let flag = true;
      for (const p of packs) {
        const rank = tileRank(packTileId(p));
        const yaojiu = isYaojiu(packTileId(p));
        if (
          !(
            (isShunzi(p) && (rank === 2 || rank === 8)) ||
            ((isKeGang(p) || isJiang(p)) && yaojiu)
          )
        ) {
          flag = false;
          break;
        }
      }

      if (flag) {
        acc.addFan(constants.FAN_QUANDAIYAO);
      }
    }

    // 断幺
    if ((handBitmap & ~constants.TILE_TYPE_BITMAP_YAOJIU) === handBitmap) {
      acc.addFan(constants.FAN_DUANYAO);
      acc.excludeFan(constants.FAN_WUZI);
    }

    // 缺一门
    {
      const suitCount =
        ((handBitmap & constants.TILE_TYPE_BITMAP_WAN) === 0n ? 0 : 1) +
        ((handBitmap & constants.TILE_TYPE_BITMAP_TIAO) === 0n ? 0 : 1) +
        ((handBitmap & constants.TILE_TYPE_BITMAP_BING) === 0n ? 0 : 1);
      if (suitCount === 2) {
        acc.addFan(constants.FAN_QUEYIMEN);
      }
    }
  }

  // 五门齐 (also applies with zuhelong)
  {
    const hasWan = (handBitmap & constants.TILE_TYPE_BITMAP_WAN) !== 0n;
    const hasTiao = (handBitmap & constants.TILE_TYPE_BITMAP_TIAO) !== 0n;
    const hasBing = (handBitmap & constants.TILE_TYPE_BITMAP_BING) !== 0n;
    const hasFeng = (handBitmap & constants.TILE_TYPE_BITMAP_FENG) !== 0n;
    const hasJian = (handBitmap & constants.TILE_TYPE_BITMAP_JIAN) !== 0n;
    if (
      (hasWan ? 1 : 0) +
        (hasTiao ? 1 : 0) +
        (hasBing ? 1 : 0) +
        (hasFeng ? 1 : 0) +
        (hasJian ? 1 : 0) ===
      5
    ) {
      acc.addFan(constants.FAN_WUMENQI);
    }
  }

  // 平和
  {
    const regularPacks = packs.filter(
      p => packType(p) !== constants.PACK_TYPE_ZUHELONG
    );
    if (
      regularPacks.length !== 7 &&
      regularPacks.length > 0 &&
      regularPacks.every(
        p => isShunzi(p) || (isJiang(p) && isShu(packTileId(p)))
      )
    ) {
      acc.addFan(constants.FAN_PINGHU);
      acc.excludeFan(constants.FAN_WUZI);
    }
  }

  // 四归一
  for (let i = constants.TILE_1m; i <= constants.TILE_P; i++) {
    let hasGang = false;
    for (const p of packs) {
      if (isGang(p) && packTileId(p) === i) {
        hasGang = true;
        break;
      }
    }

    if (hasGang) continue;
    if (handTileCount(hand, i) === 4) {
      acc.addFan(constants.FAN_SIGUIYI);
    }
  }

  // 无字
  if ((handBitmap & ~constants.TILE_TYPE_BITMAP_ZI) === handBitmap) {
    acc.addFan(constants.FAN_WUZI);
  }
};

// ── countKeGangFans ───────────────────────────────────────────────────────────
const countKeGangFans = (acc, packs) => {
  const angang = [];
  const minggang = [];
  const anke = [];

  for (let i = 0; i < packs.length; i++) {
    if (isGang(packs[i])) {
      if (isAnshou(packs[i])) {
        angang.push(i);
      } else {
        minggang.push(i);
      }
    } else if (isKezi(packs[i]) && isAnshou(packs[i])) {
      anke.push(i);
    }
  }

  const key = angang.length * 100 + minggang.length * 10 + anke.length;

  switch (key) {
    case 400:
      acc.addFan(constants.FAN_SIGANG, angang);
      acc.addFan(constants.FAN_SIANKE, angang);
      break;
    case 310:
      acc.addFan(constants.FAN_SIGANG, [
        angang[0],
        angang[1],
        angang[2],
        minggang[0]
      ]);
      acc.addFan(constants.FAN_SANANKE, angang);
      break;
    case 220:
      acc.addFan(constants.FAN_SIGANG, [
        angang[0],
        angang[1],
        minggang[0],
        minggang[1]
      ]);
      acc.addFan(constants.FAN_SHUANGANKE, angang);
      break;
    case 130:
      acc.addFan(constants.FAN_SIGANG, [
        angang[0],
        minggang[0],
        minggang[1],
        minggang[2]
      ]);
      break;
    case 301:
      acc.addFan(constants.FAN_SANGANG, angang);
      acc.addFan(constants.FAN_SIANKE, [
        angang[0],
        angang[1],
        angang[2],
        anke[0]
      ]);
      break;
    case 300:
      acc.addFan(constants.FAN_SANGANG, angang);
      acc.addFan(constants.FAN_SANANKE, angang);
      break;
    case 211:
      acc.addFan(constants.FAN_SANGANG, [angang[0], angang[1], minggang[0]]);
      acc.addFan(constants.FAN_SANANKE, [angang[0], angang[1], anke[0]]);
      break;
    case 210:
      acc.addFan(constants.FAN_SANGANG, [angang[0], angang[1], minggang[0]]);
      acc.addFan(constants.FAN_SHUANGANKE, [angang[0], angang[1]]);
      break;
    case 121:
      acc.addFan(constants.FAN_SANGANG, [angang[0], minggang[0], minggang[1]]);
      acc.addFan(constants.FAN_SHUANGANKE, [angang[0], anke[0]]);
      break;
    case 120:
      acc.addFan(constants.FAN_SANGANG, [angang[0], minggang[0], minggang[1]]);
      break;
    case 202:
      acc.addFan(constants.FAN_SHUANGANGANG, angang);
      acc.addFan(constants.FAN_SIANKE, [
        angang[0],
        angang[1],
        anke[0],
        anke[1]
      ]);
      break;
    case 201:
      acc.addFan(constants.FAN_SHUANGANGANG, angang);
      acc.addFan(constants.FAN_SANANKE, [angang[0], angang[1], anke[0]]);
      break;
    case 112:
      acc.addFan(constants.FAN_MINGANGANG, [angang[0], minggang[0]]);
      acc.addFan(constants.FAN_SANANKE, [angang[0], anke[0], anke[1]]);
      break;
    case 111:
      acc.addFan(constants.FAN_MINGANGANG, [angang[0], minggang[0]]);
      acc.addFan(constants.FAN_SHUANGANKE, [angang[0], anke[0]]);
      break;
    case 22:
      acc.addFan(constants.FAN_SHUANGMINGGANG, minggang);
      acc.addFan(constants.FAN_SHUANGANKE, anke);
      break;
    case 103:
      acc.addFan(constants.FAN_ANGANG, angang);
      acc.addFan(constants.FAN_SIANKE, [angang[0], anke[0], anke[1], anke[2]]);
      break;
    case 102:
      acc.addFan(constants.FAN_ANGANG, angang);
      acc.addFan(constants.FAN_SANANKE, [angang[0], anke[0], anke[1]]);
      break;
    case 101:
      acc.addFan(constants.FAN_ANGANG, angang);
      acc.addFan(constants.FAN_SHUANGANKE, [angang[0], anke[0]]);
      break;
    case 13:
      acc.addFan(constants.FAN_MINGGANG, minggang);
      acc.addFan(constants.FAN_SANANKE, anke);
      break;
    case 12:
      acc.addFan(constants.FAN_MINGGANG, minggang);
      acc.addFan(constants.FAN_SHUANGANKE, anke);
      break;
    default: {
      if (minggang.length === 4) acc.addFan(constants.FAN_SIGANG, minggang);
      else if (anke.length === 4) acc.addFan(constants.FAN_SIANKE, anke);
      else if (minggang.length === 3)
        acc.addFan(constants.FAN_SANGANG, minggang);
      else if (anke.length === 3) acc.addFan(constants.FAN_SANANKE, anke);
      else if (angang.length === 2)
        acc.addFan(constants.FAN_SHUANGANGANG, angang);
      else if (minggang.length === 2)
        acc.addFan(constants.FAN_SHUANGMINGGANG, minggang);
      else if (anke.length === 2) acc.addFan(constants.FAN_SHUANGANKE, anke);
      else if (minggang.length === 1 && angang.length === 1)
        acc.addFan(constants.FAN_MINGANGANG, [angang[0], minggang[0]]);
      else if (angang.length === 1) acc.addFan(constants.FAN_ANGANG, angang);
      else if (minggang.length === 1)
        acc.addFan(constants.FAN_MINGGANG, minggang);
      break;
    }
  }

  if (acc.hasFan(constants.FAN_SIGANG)) {
    acc.excludeFan(constants.FAN_PENGPENGHU);
    for (let i = 0; i < packs.length; i++) {
      if (isJiang(packs[i])) {
        acc.excludeFan(constants.FAN_DANDIAOJIANG, [i]);
        break;
      }
    }
  }

  if (acc.hasFan(constants.FAN_SHUANGANGANG)) {
    const entries = acc.fanTable.get(constants.FAN_SHUANGANGANG);
    if (entries && entries.length > 0) {
      acc.excludeFan(constants.FAN_SHUANGANKE, entries[0]);
    }
  }

  if (acc.hasFan(constants.FAN_SIANKE)) {
    acc.excludeFan(constants.FAN_PENGPENGHU);
    acc.excludeFan(constants.FAN_BUQIUREN);
    acc.excludeFan(constants.FAN_MENQIANQING);
  }
};

// ── countAssociatedCombinationFans (BFS + Union-Find) ────────────────────────
const countAssociatedCombinationFans = (acc, packs) => {
  const candidates = [];
  const shunziIds = [];
  const kegangIds = [];
  const jiangIds = [];

  for (let i = 0; i < packs.length; i++) {
    if (isShunzi(packs[i])) shunziIds.push(i);
    else if (isKeGang(packs[i])) kegangIds.push(i);
    else if (isJiang(packs[i])) jiangIds.push(i);
  }

  // 大四喜、小四喜、三风刻
  {
    const fengKegang = [];
    const fengJiang = [];
    for (let i = 0; i < packs.length; i++) {
      if (isFeng(packTileId(packs[i]))) {
        if (isKeGang(packs[i])) fengKegang.push(i);
        else fengJiang.push(i);
      }
    }

    if (fengKegang.length === 4) {
      candidates.push({ fanId: constants.FAN_DASIXI, packs: fengKegang });
    }

    if (fengKegang.length === 3 && fengJiang.length === 1) {
      candidates.push({
        fanId: constants.FAN_XIAOSIXI,
        packs: [fengKegang[0], fengKegang[1], fengKegang[2], fengJiang[0]]
      });
    }

    if (fengKegang.length === 3) {
      candidates.push({
        fanId: constants.FAN_SANFENGKE,
        packs: [fengKegang[0], fengKegang[1], fengKegang[2]]
      });
    }
  }

  // 大三元、小三元、双箭刻
  {
    const jianKegang = [];
    const jianJiang = [];
    for (let i = 0; i < packs.length; i++) {
      if (isJian(packTileId(packs[i]))) {
        if (isKeGang(packs[i])) jianKegang.push(i);
        else jianJiang.push(i);
      }
    }

    if (jianKegang.length === 3) {
      candidates.push({ fanId: constants.FAN_DASANYUAN, packs: jianKegang });
    }

    if (jianKegang.length === 2 && jianJiang.length === 1) {
      candidates.push({
        fanId: constants.FAN_XIAOSANYUAN,
        packs: [jianKegang[0], jianKegang[1], jianJiang[0]]
      });
    }

    if (jianKegang.length === 2) {
      candidates.push({
        fanId: constants.FAN_SHUANGJIANKE,
        packs: [jianKegang[0], jianKegang[1]]
      });
    }
  }

  // 一色双龙会、三色双龙会
  {
    const shunzi123 = [];
    const shunzi789 = [];
    for (const id of shunziIds) {
      const rank = tileRank(packTileId(packs[id]));
      if (rank === 2) shunzi123.push(id);
      else if (rank === 8) shunzi789.push(id);
    }

    if (
      shunzi123.length === 2 &&
      shunzi789.length === 2 &&
      jiangIds.length > 0 &&
      tileRank(packTileId(packs[jiangIds[0]])) === 5
    ) {
      const suit123a = tileSuit(packTileId(packs[shunzi123[0]]));
      const suit123b = tileSuit(packTileId(packs[shunzi123[1]]));
      const suit789a = tileSuit(packTileId(packs[shunzi789[0]]));
      const suit789b = tileSuit(packTileId(packs[shunzi789[1]]));
      const suitJiang = tileSuit(packTileId(packs[jiangIds[0]]));

      if (
        suit123a === suit123b &&
        suit123a === suit789a &&
        suit123a === suit789b &&
        suit123a === suitJiang
      ) {
        candidates.push({
          fanId: constants.FAN_YISESHUANGLONGHUI,
          packs: [
            shunzi123[0],
            shunzi123[1],
            shunzi789[0],
            shunzi789[1],
            jiangIds[0]
          ]
        });
      } else if (
        ((suit123a === suit789a && suit123b === suit789b) ||
          (suit123a === suit789b && suit123b === suit789a)) &&
        suit123a !== suit123b &&
        suit123a !== suitJiang &&
        suit123b !== suitJiang
      ) {
        candidates.push({
          fanId: constants.FAN_SANSESHUANGLONGHUI,
          packs: [
            shunzi123[0],
            shunzi123[1],
            shunzi789[0],
            shunzi789[1],
            jiangIds[0]
          ]
        });
      }
    }
  }

  // 一色四同顺、一色三同顺、一般高
  for (let i = 0; i < shunziIds.length; i++) {
    for (let j = i + 1; j < shunziIds.length; j++) {
      if (packsEqual(packs[shunziIds[i]], packs[shunziIds[j]])) {
        candidates.push({
          fanId: constants.FAN_YIBANGAO,
          packs: [shunziIds[i], shunziIds[j]]
        });
        for (let k = j + 1; k < shunziIds.length; k++) {
          if (packsEqual(packs[shunziIds[j]], packs[shunziIds[k]])) {
            candidates.push({
              fanId: constants.FAN_YISESANTONGSHUN,
              packs: [shunziIds[i], shunziIds[j], shunziIds[k]]
            });
            for (let l = k + 1; l < shunziIds.length; l++) {
              if (packsEqual(packs[shunziIds[k]], packs[shunziIds[l]])) {
                candidates.push({
                  fanId: constants.FAN_YISESITONGSHUN,
                  packs: [
                    shunziIds[i],
                    shunziIds[j],
                    shunziIds[k],
                    shunziIds[l]
                  ]
                });
              }
            }
          }
        }
      }
    }
  }

  // 一色四节高、一色三节高、三色三节高
  {
    const sortedKegang = kegangIds
      .filter(id => isShu(packTileId(packs[id])))
      .map(id => ({ rank: tileRank(packTileId(packs[id])), id }))
      .sort((a, b) => a.rank - b.rank);

    for (let i = 0; i < sortedKegang.length; i++) {
      for (let j = i + 1; j < sortedKegang.length; j++) {
        if (sortedKegang[j].rank !== sortedKegang[i].rank + 1) continue;
        for (let k = j + 1; k < sortedKegang.length; k++) {
          if (sortedKegang[k].rank !== sortedKegang[j].rank + 1) continue;
          const si = tileSuit(packTileId(packs[sortedKegang[i].id]));
          const sj = tileSuit(packTileId(packs[sortedKegang[j].id]));
          const sk = tileSuit(packTileId(packs[sortedKegang[k].id]));
          if (si !== sj && si !== sk && sj !== sk) {
            candidates.push({
              fanId: constants.FAN_SANSESANJIEGAO,
              packs: [
                sortedKegang[i].id,
                sortedKegang[j].id,
                sortedKegang[k].id
              ]
            });
          } else if (si === sj && si === sk) {
            candidates.push({
              fanId: constants.FAN_YISESANJIEGAO,
              packs: [
                sortedKegang[i].id,
                sortedKegang[j].id,
                sortedKegang[k].id
              ]
            });
          }

          for (let l = k + 1; l < sortedKegang.length; l++) {
            if (
              si === sj &&
              si === sk &&
              si === tileSuit(packTileId(packs[sortedKegang[l].id]))
            ) {
              candidates.push({
                fanId: constants.FAN_YISESIJIEGAO,
                packs: [
                  sortedKegang[i].id,
                  sortedKegang[j].id,
                  sortedKegang[k].id,
                  sortedKegang[l].id
                ]
              });
            }
          }
        }
      }
    }
  }

  // 一色四步高、一色三步高、三色三步高
  {
    const sortedShunzi = shunziIds
      .map(id => ({ rank: tileRank(packTileId(packs[id])), id }))
      .sort((a, b) => a.rank - b.rank);

    for (let i = 0; i < sortedShunzi.length; i++) {
      for (let j = i + 1; j < sortedShunzi.length; j++) {
        const step1 = sortedShunzi[j].rank - sortedShunzi[i].rank;
        if (
          (step1 !== 1 && step1 !== 2) ||
          tileSuit(packTileId(packs[sortedShunzi[i].id])) !==
            tileSuit(packTileId(packs[sortedShunzi[j].id]))
        )
          continue;
        for (let k = j + 1; k < sortedShunzi.length; k++) {
          const step2 = sortedShunzi[k].rank - sortedShunzi[j].rank;
          if (
            (step2 !== 1 && step2 !== 2) ||
            tileSuit(packTileId(packs[sortedShunzi[j].id])) !==
              tileSuit(packTileId(packs[sortedShunzi[k].id]))
          )
            continue;
          if (step1 === step2) {
            candidates.push({
              fanId: constants.FAN_YISESANBUGAO,
              packs: [
                sortedShunzi[i].id,
                sortedShunzi[j].id,
                sortedShunzi[k].id
              ]
            });
          }

          for (let l = k + 1; l < sortedShunzi.length; l++) {
            const step3 = sortedShunzi[l].rank - sortedShunzi[k].rank;
            if (
              (step3 !== 1 && step3 !== 2) ||
              tileSuit(packTileId(packs[sortedShunzi[k].id])) !==
                tileSuit(packTileId(packs[sortedShunzi[l].id]))
            )
              continue;
            if (step1 === step2 && step1 === step3) {
              candidates.push({
                fanId: constants.FAN_YISESIBUGAO,
                packs: [
                  sortedShunzi[i].id,
                  sortedShunzi[j].id,
                  sortedShunzi[k].id,
                  sortedShunzi[l].id
                ]
              });
            }
          }
        }
      }
    }

    for (let i = 0; i < sortedShunzi.length; i++) {
      for (let j = i + 1; j < sortedShunzi.length; j++) {
        if (
          sortedShunzi[j].rank - sortedShunzi[i].rank !== 1 ||
          tileSuit(packTileId(packs[sortedShunzi[i].id])) ===
            tileSuit(packTileId(packs[sortedShunzi[j].id]))
        )
          continue;
        for (let k = j + 1; k < sortedShunzi.length; k++) {
          if (
            sortedShunzi[k].rank - sortedShunzi[j].rank !== 1 ||
            tileSuit(packTileId(packs[sortedShunzi[i].id])) ===
              tileSuit(packTileId(packs[sortedShunzi[k].id])) ||
            tileSuit(packTileId(packs[sortedShunzi[j].id])) ===
              tileSuit(packTileId(packs[sortedShunzi[k].id]))
          )
            continue;
          candidates.push({
            fanId: constants.FAN_SANSESANBUGAO,
            packs: [sortedShunzi[i].id, sortedShunzi[j].id, sortedShunzi[k].id]
          });
        }
      }
    }
  }

  // 清龙、花龙
  {
    const rankMap = new Map();
    for (const id of shunziIds) {
      const rank = tileRank(packTileId(packs[id]));
      if (!rankMap.has(rank)) rankMap.set(rank, []);
      rankMap.get(rank).push(id);
    }

    if (rankMap.has(2) && rankMap.has(5) && rankMap.has(8)) {
      for (const i of rankMap.get(2)) {
        for (const j of rankMap.get(5)) {
          for (const k of rankMap.get(8)) {
            const s1 = tileSuit(packTileId(packs[i]));
            const s2 = tileSuit(packTileId(packs[j]));
            const s3 = tileSuit(packTileId(packs[k]));
            if (s1 === s2 && s1 === s3) {
              candidates.push({
                fanId: constants.FAN_QINGLONG,
                packs: [i, j, k]
              });
            }

            if (s1 !== s2 && s1 !== s3 && s2 !== s3) {
              candidates.push({
                fanId: constants.FAN_HUALONG,
                packs: [i, j, k]
              });
            }
          }
        }
      }
    }
  }

  // 三同刻、双同刻
  for (let i = 0; i < kegangIds.length; i++) {
    for (let j = i + 1; j < kegangIds.length; j++) {
      if (
        isShu(packTileId(packs[kegangIds[i]])) &&
        tileRank(packTileId(packs[kegangIds[i]])) ===
          tileRank(packTileId(packs[kegangIds[j]]))
      ) {
        candidates.push({
          fanId: constants.FAN_SHUANGTONGKE,
          packs: [kegangIds[i], kegangIds[j]]
        });
        for (let k = j + 1; k < kegangIds.length; k++) {
          if (
            tileRank(packTileId(packs[kegangIds[j]])) ===
            tileRank(packTileId(packs[kegangIds[k]]))
          ) {
            candidates.push({
              fanId: constants.FAN_SANTONGKE,
              packs: [kegangIds[i], kegangIds[j], kegangIds[k]]
            });
          }
        }
      }
    }
  }

  // 三色三同顺
  for (let i = 0; i < shunziIds.length; i++) {
    for (let j = i + 1; j < shunziIds.length; j++) {
      if (
        tileRank(packTileId(packs[shunziIds[i]])) !==
          tileRank(packTileId(packs[shunziIds[j]])) ||
        tileSuit(packTileId(packs[shunziIds[i]])) ===
          tileSuit(packTileId(packs[shunziIds[j]]))
      )
        continue;
      for (let k = j + 1; k < shunziIds.length; k++) {
        if (
          tileRank(packTileId(packs[shunziIds[j]])) ===
            tileRank(packTileId(packs[shunziIds[k]])) &&
          tileSuit(packTileId(packs[shunziIds[i]])) !==
            tileSuit(packTileId(packs[shunziIds[k]])) &&
          tileSuit(packTileId(packs[shunziIds[j]])) !==
            tileSuit(packTileId(packs[shunziIds[k]]))
        ) {
          candidates.push({
            fanId: constants.FAN_SANSESANTONGSHUN,
            packs: [shunziIds[i], shunziIds[j], shunziIds[k]]
          });
        }
      }
    }
  }

  // 喜相逢、连六、老少副
  for (let i = 0; i < shunziIds.length; i++) {
    for (let j = i + 1; j < shunziIds.length; j++) {
      const si = tileSuit(packTileId(packs[shunziIds[i]]));
      const sj = tileSuit(packTileId(packs[shunziIds[j]]));
      const ri = tileRank(packTileId(packs[shunziIds[i]]));
      const rj = tileRank(packTileId(packs[shunziIds[j]]));
      if (si !== sj) {
        if (ri === rj) {
          candidates.push({
            fanId: constants.FAN_XIXIANGFENG,
            packs: [shunziIds[i], shunziIds[j]]
          });
        }
      } else if (ri === rj + 3 || ri === rj - 3) {
        candidates.push({
          fanId: constants.FAN_LIANLIU,
          packs: [shunziIds[i], shunziIds[j]]
        });
      } else if (ri === rj + 6 || ri === rj - 6) {
        candidates.push({
          fanId: constants.FAN_LAOSHAOFU,
          packs: [shunziIds[i], shunziIds[j]]
        });
      }
    }
  }

  if (candidates.length === 0) return;

  const bestState = bfsOptimize(candidates, packs.length);
  if (!bestState) return;

  for (const id of bestState.eids) {
    const c = candidates[id];
    acc.addFan(c.fanId, c.packs);

    switch (c.fanId) {
      case constants.FAN_DASIXI:
        acc.excludeFan(constants.FAN_PENGPENGHU);
        for (const pi of c.packs) {
          if (isFeng(packTileId(packs[pi]))) {
            acc.excludeFan(constants.FAN_QUANFENGKE, [pi]);
            acc.excludeFan(constants.FAN_MENFENGKE, [pi]);
            acc.excludeFan(constants.FAN_YAOJIUKE, [pi]);
          }
        }

        break;
      case constants.FAN_DASANYUAN:
      case constants.FAN_XIAOSANYUAN:
      case constants.FAN_SHUANGJIANKE:
        for (const pi of c.packs) {
          if (isJian(packTileId(packs[pi]))) {
            acc.excludeFan(constants.FAN_JIANKE, [pi]);
            acc.excludeFan(constants.FAN_YAOJIUKE, [pi]);
          }
        }

        break;
      case constants.FAN_XIAOSIXI:
      case constants.FAN_SANFENGKE:
        for (const pi of c.packs) {
          if (isFeng(packTileId(packs[pi]))) {
            acc.excludeFan(constants.FAN_YAOJIUKE, [pi]);
          }
        }

        break;
      case constants.FAN_YISESHUANGLONGHUI:
        acc.excludeFan(constants.FAN_QINGYISE);
        acc.excludeFan(constants.FAN_PINGHU);
        acc.excludeFan(constants.FAN_WUZI);
        break;
      case constants.FAN_YISESITONGSHUN:
        acc.excludeFan(constants.FAN_SIGUIYI);
        acc.excludeFan(constants.FAN_SIGUIYI);
        acc.excludeFan(constants.FAN_SIGUIYI);
        break;
      case constants.FAN_YISESIJIEGAO:
        acc.excludeFan(constants.FAN_PENGPENGHU);
        break;
      case constants.FAN_SANSESHUANGLONGHUI:
        acc.excludeFan(constants.FAN_PINGHU);
        break;
      default:
        break;
    }
  }
};

// BFS + Union-Find optimization
const bfsOptimize = (candidates, packCount) => {
  class UF {
    constructor(n) {
      this.f = Array.from({ length: n }, (_, i) => i);
    }

    find(x) {
      if (this.f[x] !== x) this.f[x] = this.find(this.f[x]);
      return this.f[x];
    }

    union(a, b) {
      const ra = this.find(a);
      const rb = this.find(b);
      if (ra === rb) return false;
      if (ra < rb) this.f[rb] = ra;
      else this.f[ra] = rb;
      return true;
    }

    clone() {
      const copy = new UF(0);
      copy.f = this.f.slice();
      return copy;
    }

    hash() {
      let h = 0;
      for (let i = 0; i < this.f.length; i++) {
        h = h * 5 + this.find(i);
      }

      return h;
    }
  }

  class State {
    constructor() {
      this.uf = new UF(packCount);
      this.eids = [];
      this.score = 0;
    }

    tryAdd(id) {
      const v = candidates[id].packs;
      for (let i = 0; i < v.length; i++) {
        for (let j = i + 1; j < v.length; j++) {
          if (this.uf.find(v[i]) === this.uf.find(v[j])) {
            return null;
          }
        }
      }

      const newState = new State();
      newState.uf = this.uf.clone();
      newState.eids = this.eids.slice();
      newState.score = this.score;
      for (let i = 1; i < v.length; i++) {
        newState.uf.union(v[i], v[i - 1]);
      }

      newState.eids.push(id);
      newState.score += constants.FAN_SCORE[candidates[id].fanId];
      return newState;
    }
  }

  const visited = new Map();
  let bestState = null;
  let bestScore = 0;

  const queue = [new State()];
  visited.set(new State().uf.hash(), 0);

  while (queue.length > 0) {
    const current = queue.shift();
    for (let i = 0; i < candidates.length; i++) {
      const next = current.tryAdd(i);
      if (!next) continue;
      const h = next.uf.hash();
      if (visited.has(h) && visited.get(h) >= next.score) continue;
      visited.set(h, next.score);
      queue.push(next);
      if (next.score > bestScore) {
        bestScore = next.score;
        bestState = next;
      }
    }
  }

  return bestState;
};

// ── countSinglePackFans ──────────────────────────────────────────────────────
const countSinglePackFans = (acc, hand, packs) => {
  for (let i = 0; i < packs.length; i++) {
    const p = packs[i];
    if (!isKeGang(p)) continue;

    const tid = packTileId(p);

    if (isJian(tid)) {
      acc.addFan(constants.FAN_JIANKE, [i]);
      acc.excludeFan(constants.FAN_YAOJIUKE, [i]);
    }

    if (tid === hand.context.quanfeng) {
      acc.addFan(constants.FAN_QUANFENGKE, [i]);
      acc.excludeFan(constants.FAN_YAOJIUKE, [i]);
    }

    if (tid === hand.context.menfeng) {
      acc.addFan(constants.FAN_MENFENGKE, [i]);
      acc.excludeFan(constants.FAN_YAOJIUKE, [i]);
    }

    if (isYaojiu(tid)) {
      acc.addFan(constants.FAN_YAOJIUKE, [i]);
    }
  }
};

// ── countWinModeFans ─────────────────────────────────────────────────────────
const countWinModeFans = (acc, hand, packs, zuhelongType) => {
  const ctx = hand.context;

  // 妙手回春
  if (ctx.haidi && ctx.zimo) {
    acc.addFan(constants.FAN_MIAOSHOUHUICHUN);
    acc.excludeFan(constants.FAN_ZIMO);
  }

  // 海底捞月
  if (ctx.haidi && !ctx.zimo) {
    acc.addFan(constants.FAN_HAIDILAOYUE);
  }

  // 杠上开花
  if (ctx.gang && ctx.zimo) {
    acc.addFan(constants.FAN_GANGSHANGKAIHUA);
    acc.excludeFan(constants.FAN_ZIMO);
  }

  // 抢杠和
  if (ctx.gang && !ctx.zimo) {
    acc.addFan(constants.FAN_QIANGGANGHU);
    acc.excludeFan(constants.FAN_HUJUEZHANG);
  }

  // 全求人
  const allFulu =
    hand.packs.length === 4 && hand.packs.every(p => !isAnshou(p));
  if (allFulu && !ctx.zimo) {
    acc.addFan(constants.FAN_QUANQIUREN);
    for (let i = 0; i < packs.length; i++) {
      if (isJiang(packs[i])) {
        acc.excludeFan(constants.FAN_DANDIAOJIANG, [i]);
        break;
      }
    }
  }

  // 不求人
  if (isMenqing(hand) && ctx.zimo) {
    acc.addFan(constants.FAN_BUQIUREN);
    acc.excludeFan(constants.FAN_MENQIANQING);
    acc.excludeFan(constants.FAN_ZIMO);
  }

  // 和绝张
  if (ctx.juezhang) {
    acc.addFan(constants.FAN_HUJUEZHANG);
    for (let i = 0; i < packs.length; i++) {
      if (isJiang(packs[i])) {
        acc.excludeFan(constants.FAN_DANDIAOJIANG, [i]);
        break;
      }
    }
  }

  // 门前清
  if (isMenqing(hand)) {
    acc.addFan(constants.FAN_MENQIANQING);
  }

  // 边张、坎张、单钓将
  {
    const winTileId = hand.winningTile
      ? hand.winningTile.GetId()
      : hand.tiles[hand.tiles.length - 1].GetId();
    const zbm = zuhelongType > 0 ? constants.ZuhelongBitmap[zuhelongType] : 0n;
    const winBitmap = 1n << BigInt(winTileId);

    // For zuhelong hands, determine wait type from pack structure directly
    // (zuhelong tiles can't form regular melds).
    // For non-zuhelong hands, check the specific decomposition's packs to see
    // if the winning tile is in a single-wait position (jiang/bian/kan), then
    // verify no other tile can complete the hand.
    // Find all packs containing the winning tile, classify wait type,
    // and verify it's a single-tile wait (no other tile can complete the hand).
    // Prefer shunzi-based wait (bian/kan) over jiang (dandiaojiang), since the
    // winning tile may appear in both a declared shunzi pack and a decomposed
    // shunzi/jiang pack.
    let canDetectWait = false;
    let waitFanId = 0;
    let waitPackIdx = -1;

    // Build tile counts from the 13 non-winning tiles for single-wait verification.
    // hand.tiles has 14 tiles with the winning tile as the last element.
    const tileCountsForVerify = new Array(constants.TILE_P + 1).fill(0);
    for (let ti = 0; ti < hand.tiles.length - 1; ti++) {
      tileCountsForVerify[hand.tiles[ti].GetId()]++;
    }

    if (zuhelongType > 0) {
      const winInZuhelong = (zbm & winBitmap) !== 0n;

      // eslint-disable-next-line no-negated-condition
      if (!winInZuhelong) {
        // Winning tile is outside zuhelong: check non-zuhelong packs
        for (let i = 0; i < packs.length; i++) {
          const p = packs[i];
          const pt = packType(p);
          if (pt === constants.PACK_TYPE_ZUHELONG) continue;
          if (!packContainsWinningTile(p, winTileId)) continue;

          if (isJiang(p)) {
            waitFanId = constants.FAN_DANDIAOJIANG;
            waitPackIdx = i;
          } else if (isShunzi(p)) {
            const midRank = tileRank(packTileId(p));
            const winRank = tileRank(winTileId);
            if (
              (midRank === 2 && winRank === 3) ||
              (midRank === 8 && winRank === 7)
            ) {
              waitFanId = constants.FAN_BIANZHANG;
              waitPackIdx = i;
            } else if (midRank === winRank) {
              waitFanId = constants.FAN_KANZHANG;
              waitPackIdx = i;
            }
          }

          if (waitPackIdx >= 0) break;
        }

        // If not found in packs, the winning tile completes a shunzi/pair
        // with remaining tiles (may also use tiles from zuhelong)
        if (waitPackIdx < 0) {
          const remaining = [];
          let bm2 = zbm;
          for (const tile of hand.tiles) {
            const tbm = tile.GetBitmap();
            if (bm2 & tbm) {
              bm2 ^= tbm;
            } else {
              remaining.push(tile);
            }
          }

          // Remove winning tile from remaining
          const winIdx = remaining.findIndex(t => t.GetId() === winTileId);
          if (winIdx >= 0) remaining.splice(winIdx, 1);

          // Check if winning tile completes a pair with remaining
          const hasPair = remaining.some(t => t.GetId() === winTileId);
          if (hasPair) {
            waitFanId = constants.FAN_DANDIAOJIANG;
            // Find the jiang pack index
            for (let i = 0; i < packs.length; i++) {
              if (isJiang(packs[i]) && packTileId(packs[i]) === winTileId) {
                waitPackIdx = i;
                break;
              }
            }

            if (waitPackIdx < 0) {
              for (let i = 0; i < packs.length; i++) {
                if (packType(packs[i]) === constants.PACK_TYPE_ZUHELONG) {
                  waitPackIdx = i;
                  break;
                }
              }
            }
          } else {
            // Check if winning tile completes a shunzi.
            // The shunzi may use tiles from remaining or from the zuhelong
            // (e.g., winning tile 2p + remaining 3p + zuhelong 4p).
            const allCounts = new Array(constants.TILE_P + 1).fill(0);
            for (const tile of hand.tiles) {
              if (tile.GetId() !== winTileId) allCounts[tile.GetId()]++;
            }

            const winRank = tileRank(winTileId);
            const isLow =
              winRank <= 7 &&
              allCounts[winTileId + 1] > 0 &&
              allCounts[winTileId + 2] > 0;
            const isMid =
              winRank >= 2 &&
              winRank <= 8 &&
              allCounts[winTileId - 1] > 0 &&
              allCounts[winTileId + 1] > 0;
            const isHigh =
              winRank >= 3 &&
              allCounts[winTileId - 1] > 0 &&
              allCounts[winTileId - 2] > 0;

            if (isLow || isMid || isHigh) {
              if (isMid && !isLow && !isHigh) {
                waitFanId = constants.FAN_KANZHANG;
              } else {
                waitFanId = constants.FAN_BIANZHANG;
              }

              for (let i = 0; i < packs.length; i++) {
                const p = packs[i];
                if (packType(p) === constants.PACK_TYPE_ZUHELONG) {
                  waitPackIdx = i;
                  break;
                }
              }

              if (waitPackIdx < 0) waitPackIdx = packs.length - 1;
            }
          }
        }
      } else {
        // Winning tile is part of zuhelong itself.
        // After removing zuhelong tiles, get the non-zuhelong remaining tiles.
        const remaining = [];
        let bm2 = zbm;
        for (const tile of hand.tiles) {
          const tbm = tile.GetBitmap();
          if (bm2 & tbm) {
            bm2 ^= tbm;
          } else {
            remaining.push(tile);
          }
        }

        // Find which zuhelong group the winning tile belongs to.
        const zlTileIds = [];
        let bm3 = zbm;
        for (const tile of hand.tiles) {
          const tbm = tile.GetBitmap();
          if (bm3 & tbm) {
            bm3 ^= tbm;
            zlTileIds.push(tile.GetId());
          }
        }

        zlTileIds.sort((a, b) => a - b);

        let winGroup = null;
        for (let g = 0; g < 3; g++) {
          const group = zlTileIds.slice(g * 3, (g + 1) * 3);
          if (group.includes(winTileId)) {
            winGroup = group;
            break;
          }
        }

        if (winGroup) {
          const groupLow = Math.min(...winGroup);
          const posInGroup = winTileId - groupLow;
          if (posInGroup === 0 || posInGroup === 6) {
            waitFanId = constants.FAN_BIANZHANG;
          } else {
            waitFanId = constants.FAN_KANZHANG;
          }

          // Verify single-tile wait:
          // Non-zuhelong remaining tiles must not contain pairs (no
          // alternative pair for jiang). Since the winning tile is the
          // only one that can restore the incomplete zuhelong group, and
          // no pair exists in remaining tiles, no other tile completes
          // the hand.
          const remCounts = new Array(constants.TILE_P + 1).fill(0);
          for (const t of remaining) remCounts[t.GetId()]++;

          let hasRemPair = false;
          for (let t = constants.TILE_1m; t <= constants.TILE_P; t++) {
            if (remCounts[t] >= 2) {
              hasRemPair = true;
              break;
            }
          }

          if (!hasRemPair) {
            for (let i = 0; i < packs.length; i++) {
              if (packType(packs[i]) === constants.PACK_TYPE_ZUHELONG) {
                waitPackIdx = i;
                break;
              }
            }
          }
        }
      }

      // For zuhelong hands, the pack-based detection (jiang/shunzi) or
      // group-based detection (winInZuhelong) already correctly identifies
      // the wait type. No canFormMelds verification needed since zuhelong
      // tiles can't form regular melds.
      if (waitPackIdx >= 0) {
        canDetectWait = true;
      }
    } else {
      // First pass: find shunzi-based wait (bian/kan) in any pack
      for (let i = 0; i < packs.length; i++) {
        const p = packs[i];
        const pt = packType(p);
        if (pt === constants.PACK_TYPE_ZUHELONG) continue;
        if (!isShunzi(p) || !packContainsWinningTile(p, winTileId)) continue;

        const midRank = tileRank(packTileId(p));
        const winRank = tileRank(winTileId);
        const isBian =
          (midRank === 2 && winRank === 3) || (midRank === 8 && winRank === 7);
        const isKan = midRank === winRank;

        if (isBian || isKan) {
          waitFanId = isBian ? constants.FAN_BIANZHANG : constants.FAN_KANZHANG;
          waitPackIdx = i;
          break;
        }
      }

      // Second pass: if no shunzi wait found, check for jiang (dandiaojiang)
      if (waitPackIdx < 0) {
        for (let i = 0; i < packs.length; i++) {
          const p = packs[i];
          const pt = packType(p);
          if (pt === constants.PACK_TYPE_ZUHELONG) continue;
          if (isJiang(p) && packContainsWinningTile(p, winTileId)) {
            waitFanId = constants.FAN_DANDIAOJIANG;
            waitPackIdx = i;
            break;
          }
        }
      }

      // Verify single-tile wait: no other tile can complete the hand
      if (waitPackIdx >= 0) {
        canDetectWait = true;
        for (let t = constants.TILE_1m; t <= constants.TILE_P; t++) {
          if (t === winTileId) continue;
          tileCountsForVerify[t]++;
          if (canFormMelds(tileCountsForVerify, hand.packs.length)) {
            canDetectWait = false;
            tileCountsForVerify[t]--;
            break;
          }

          tileCountsForVerify[t]--;
        }
      }
    }

    if (canDetectWait) {
      acc.addFan(waitFanId, waitPackIdx >= 0 ? [waitPackIdx] : []);
    }
  }

  // 自摸
  if (ctx.zimo) {
    acc.addFan(constants.FAN_ZIMO);
    if (
      (acc.hasFan(constants.FAN_JIULIANBAODENG) ||
        acc.hasFan(constants.FAN_SIANKE)) &&
      !acc.hasFan(constants.FAN_MIAOSHOUHUICHUN) &&
      !acc.hasFan(constants.FAN_GANGSHANGKAIHUA)
    ) {
      acc.excludedTable.delete(constants.FAN_ZIMO);
    }
  }
};

const packContainsWinningTile = (pack, winTileId) => {
  const tid = packTileId(pack);
  if (isShunzi(pack)) {
    return winTileId === tid - 1 || winTileId === tid || winTileId === tid + 1;
  }

  return tid === winTileId;
};

const canFormMelds = (counts, meldCount) => {
  const c = counts.slice();
  const target = 4 - meldCount;

  for (let t = constants.TILE_1m; t <= constants.TILE_P; t++) {
    if (c[t] < 2) continue;
    c[t] -= 2;
    if (canFormNMelds(c, target)) {
      c[t] += 2;
      return true;
    }

    c[t] += 2;
  }

  return false;
};

const canFormNMelds = (counts, n) => {
  if (n === 0) {
    return counts.every(c => c === 0);
  }

  let first = -1;
  for (let t = constants.TILE_1m; t <= constants.TILE_P; t++) {
    if (counts[t] > 0) {
      first = t;
      break;
    }
  }

  if (first === -1) return n === 0;

  if (counts[first] >= 3) {
    counts[first] -= 3;
    const ok = canFormNMelds(counts, n - 1);
    counts[first] += 3;
    if (ok) return true;
  }

  if (
    isNumberedTile(first) &&
    tileRank(first) <= 7 &&
    counts[first + 1] > 0 &&
    counts[first + 2] > 0
  ) {
    counts[first]--;
    counts[first + 1]--;
    counts[first + 2]--;
    const ok = canFormNMelds(counts, n - 1);
    counts[first]++;
    counts[first + 1]++;
    counts[first + 2]++;
    if (ok) return true;
  }

  return false;
};

// ── Zuhelong detection ───────────────────────────────────────────────────────
const judgeZuhelong = tileBitmap => {
  for (let i = 1; i <= 6; i++) {
    if (
      (tileBitmap & constants.ZuhelongBitmap[i]) ===
      constants.ZuhelongBitmap[i]
    ) {
      return i;
    }
  }

  return 0;
};

const judgePartOfZuhelong = bitmap => {
  const shuBitmap = bitmap & constants.TILE_TYPE_BITMAP_SHU;
  for (let i = 1; i <= 6; i++) {
    if (
      (constants.ZuhelongBitmap[i] | shuBitmap) ===
      constants.ZuhelongBitmap[i]
    ) {
      return true;
    }
  }

  return false;
};

// ── Special hand detection ────────────────────────────────────────────────────
const isCompleteClosedHand = hand =>
  Boolean(hand) && hand.packs.length === 0 && hand.tiles.length === 14;

const buildTileCounts = tiles => {
  const counts = new Map();
  for (const tile of tiles) {
    const id = tile.GetId();
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return counts;
};

const isQidui = hand => {
  if (!isCompleteClosedHand(hand)) return false;
  let pairCount = 0;
  for (const count of buildTileCounts(hand.tiles).values()) {
    if (count !== 2 && count !== 4) return false;
    pairCount += count / 2;
  }

  return pairCount === 7;
};

const isLianqidui = hand => {
  if (!isQidui(hand)) return false;
  const uniqueIds = [...new Set(hand.tiles.map(t => t.GetId()))].sort(
    (a, b) => a - b
  );
  for (let i = 1; i < uniqueIds.length; i++) {
    if (
      uniqueIds[i] !== uniqueIds[i - 1] + 1 ||
      tileSuit(uniqueIds[i]) !== tileSuit(uniqueIds[i - 1])
    ) {
      return false;
    }
  }

  return true;
};

const isMeaningfulTile = tileId =>
  tileId >= constants.TILE_1m && tileId <= constants.TILE_P;

const isBukaoStructure = hand => {
  if (!isCompleteClosedHand(hand)) return false;
  const tileIds = hand.tiles.map(t => t.GetId());
  const uniqueTiles = new Set(tileIds);
  if (uniqueTiles.size !== 14 || !tileIds.every(isMeaningfulTile)) return false;
  const bitmap = collectTileBitmap(hand.tiles);
  return judgePartOfZuhelong(bitmap);
};

const isQuanbukao = hand => {
  if (!isBukaoStructure(hand)) return false;
  const honorCount = hand.tiles.filter(t => isHonorTile(t.GetId())).length;
  return honorCount < 7;
};

const isQixingbukao = hand => {
  if (!isBukaoStructure(hand)) return false;
  const honorCount = hand.tiles.filter(t => isHonorTile(t.GetId())).length;
  return honorCount === 7;
};

const judgeCompleteSpecialHu = hand => {
  if (!isCompleteClosedHand(hand)) return 0;
  const bitmap = collectTileBitmap(hand.tiles);
  const cnt = bitPopCount(bitmap);

  if ((bitmap & constants.TILE_TYPE_BITMAP_YAOJIU) === bitmap && cnt === 13) {
    return constants.FAN_SHISANYAO;
  }

  if (
    judgePartOfZuhelong(bitmap) &&
    (bitmap & constants.TILE_TYPE_BITMAP_MEANINGFUL) === bitmap &&
    cnt === 14
  ) {
    if (
      (bitmap & constants.TILE_TYPE_BITMAP_ZI) ===
      constants.TILE_TYPE_BITMAP_ZI
    ) {
      return constants.FAN_QIXINGBUKAO;
    }

    return constants.FAN_QUANBUKAO;
  }

  return 0;
};

const judgeQidui = hand => {
  if (!isQidui(hand)) return 0;
  return isLianqidui(hand) ? constants.FAN_LIANQIDUI : constants.FAN_QIDUI;
};

// ── Zuhelong decomposition ───────────────────────────────────────────────────
const enumerateZuhelongDecompositions = (hand, zuhelongType) => {
  const results = [];
  const zuhelongBitmap = constants.ZuhelongBitmap[zuhelongType];

  // Remove zuhelong tiles from hand.tiles only (not hand.packs)
  const remaining = [];
  let bm = zuhelongBitmap;
  for (const tile of hand.tiles) {
    const tbm = tile.GetBitmap();
    if (bm & tbm) {
      bm ^= tbm;
    } else {
      remaining.push(tile);
    }
  }

  const counts = new Array(constants.TILE_P + 1).fill(0);
  for (const tile of remaining) {
    counts[tile.GetId()]++;
  }

  const zuhelongPack = {
    type: constants.PACK_TYPE_ZUHELONG,
    tile: { GetId: () => 0, GetBitmap: () => 0n },
    offer: 0,
    zuhelong: zuhelongType
  };

  // Number of melds needed from remaining tiles:
  // Total packs: 5 = 4 melds + 1 pair
  // With zuhelong (counts as 1 pack): 5 = zuhelong + (4-1) melds + 1 pair
  // From hand.packs: hand.packs.length melds
  // From remaining tiles: (4 - 1 - hand.packs.length) melds + 1 pair
  const meldsNeeded = 1 - hand.packs.length;

  // Try to find pair + meldsNeeded melds from remaining tiles
  for (let t = constants.TILE_1m; t <= constants.TILE_P; t++) {
    if (counts[t] < 2) continue;
    counts[t] -= 2;

    const pairPack = {
      type: constants.PACK_TYPE_JIANG,
      tile: { GetId: () => t, GetBitmap: () => 1n << BigInt(t) },
      offer: 0
    };

    if (meldsNeeded <= 0) {
      // Only need pair from tiles
      results.push({ packs: [pairPack, zuhelongPack], zuhelongPack });
    } else {
      // Need pair + melds from tiles
      const melds = findNMelds(counts, meldsNeeded);
      if (melds) {
        results.push({
          packs: [...melds, pairPack, zuhelongPack],
          zuhelongPack
        });
      }
    }

    counts[t] += 2;
  }

  return results;
};

const findNMelds = (counts, n) => {
  if (n === 0) {
    // Check all counts are 0
    for (let t = constants.TILE_1m; t <= constants.TILE_P; t++) {
      if (counts[t] !== 0) return null;
    }

    return [];
  }

  const c = counts.slice();
  const melds = [];
  for (let i = 0; i < n; i++) {
    const meld = findMeld(c);
    if (!meld) return null;
    melds.push(meld);
    // Subtract meld tiles from counts
    const tid = meld.tile.GetId();
    if (meld.type === constants.PACK_TYPE_KEZI) {
      c[tid] -= 3;
    } else if (meld.type === constants.PACK_TYPE_SHUNZI) {
      c[tid - 1]--;
      c[tid]--;
      c[tid + 1]--;
    }
  }

  // Verify all remaining counts are 0
  for (let t = constants.TILE_1m; t <= constants.TILE_P; t++) {
    if (c[t] !== 0) return null;
  }

  return melds;
};

const findMeld = counts => {
  for (let t = constants.TILE_1m; t <= constants.TILE_P; t++) {
    if (counts[t] === 0) continue;

    if (counts[t] >= 3) {
      return {
        type: constants.PACK_TYPE_KEZI,
        tile: { GetId: () => t, GetBitmap: () => 1n << BigInt(t) },
        offer: 0
      };
    }

    if (
      isNumberedTile(t) &&
      tileRank(t) <= 7 &&
      counts[t + 1] > 0 &&
      counts[t + 2] > 0
    ) {
      return {
        type: constants.PACK_TYPE_SHUNZI,
        tile: { GetId: () => t + 1, GetBitmap: () => 1n << BigInt(t + 1) },
        offer: 0
      };
    }

    break;
  }

  return null;
};

// Mark the pack containing the winning tile:
//   zimo=true (self-drawn): offer=-1 (IsAnshou stays true, pack stays concealed)
//   zimo=false (claimed):   offer=-2 (IsAnshou becomes false, pack treated as open)
// This mirrors the C++ behavior where the winning tile's pack status depends on
// whether the win was self-drawn or from a discard.
const markWinningTilePacks = (
  decompositions,
  winTileId,
  handPackCount,
  zimo
) => {
  for (const packs of decompositions) {
    for (let i = 0; i < packs.length; i++) {
      const p = packs[i];
      const type = packType(p);
      if (type === constants.PACK_TYPE_ZUHELONG) continue;
      if (!packContainsWinningTile(p, winTileId)) continue;

      // Only mark decomposition-created packs (index >= handPackCount)
      if (i >= handPackCount) {
        const newOffer = zimo ? -1 : -2;
        if (typeof p.SetOffer === "function") {
          p.SetOffer(newOffer);
        } else {
          p.offer = newOffer;
        }
      }

      break;
    }
  }
};

// ── Main entry point ──────────────────────────────────────────────────────────
const evaluateFanRules = (input, overrides = {}) => {
  const hand = normalizeHandInput(input, overrides);

  let bestResult = null;
  let bestTotal = 0;

  const tileBitmap = collectTileBitmap(hand.tiles);
  const zuhelongType = judgeZuhelong(tileBitmap);

  // 1. Try complete special hands
  if (isCompleteClosedHand(hand)) {
    const specialFan = judgeCompleteSpecialHu(hand);
    if (specialFan) {
      const acc = new FanAccumulator();
      acc.addFan(specialFan);
      countWinModeFans(acc, hand, [], 0);

      if (zuhelongType > 0) {
        acc.addFan(constants.FAN_ZUHELONG, []);
      }

      acc.excludeFan(constants.FAN_BUQIUREN);
      acc.excludeFan(constants.FAN_MENQIANQING);
      if (hand.context.zimo) {
        acc.fanTable.delete(constants.FAN_ZIMO);
        acc.excludedTable.delete(constants.FAN_ZIMO);
        acc.addFan(constants.FAN_ZIMO);
      }

      acc.applyExclusions();
      if (acc.getTotal() === 0) {
        acc.addFan(constants.FAN_WUFANHU);
      }

      if (acc.getTotal() > bestTotal) {
        bestTotal = acc.getTotal();
        bestResult = buildResult(acc, hand, null);
      }
    }
  }

  // 2. Try qidui
  if (isCompleteClosedHand(hand)) {
    const qiduiFan = judgeQidui(hand);
    if (qiduiFan) {
      const acc = new FanAccumulator();
      acc.addFan(qiduiFan);
      countOverallAttrFans(acc, hand, [], 0);
      countWinModeFans(acc, hand, [], 0);
      acc.excludeFan(constants.FAN_BUQIUREN);
      acc.excludeFan(constants.FAN_MENQIANQING);
      if (qiduiFan === constants.FAN_LIANQIDUI) {
        acc.excludeFan(constants.FAN_QINGYISE);
        acc.excludeFan(constants.FAN_WUZI);
      }

      if (hand.context.zimo) {
        acc.fanTable.delete(constants.FAN_ZIMO);
        acc.excludedTable.delete(constants.FAN_ZIMO);
        acc.addFan(constants.FAN_ZIMO);
      }

      acc.applyExclusions();
      if (acc.getTotal() === 0) {
        acc.addFan(constants.FAN_WUFANHU);
      }

      if (acc.getTotal() > bestTotal) {
        bestTotal = acc.getTotal();
        bestResult = buildResult(acc, hand, null);
      }
    }
  }

  // 3. Try basic decompositions
  const isBukao = isQuanbukao(hand) || isQixingbukao(hand);
  let zuhelongBitmap =
    zuhelongType > 0 ? constants.ZuhelongBitmap[zuhelongType] : 0n;

  let sortedTiles = hand.tiles.slice();
  if (zuhelongBitmap && !isBukao) {
    const remaining = [];
    let bm = zuhelongBitmap;
    for (const tile of sortedTiles) {
      const tbm = tile.GetBitmap();
      if (bm & tbm) {
        bm ^= tbm;
      } else {
        remaining.push(tile);
      }
    }

    sortedTiles = remaining;
  }

  const decompositions = enumerateDecompositions({
    ...hand,
    tiles: sortedTiles
  });

  const winTileId = hand.winningTile
    ? hand.winningTile.GetId()
    : hand.tiles.length > 0
    ? hand.tiles[hand.tiles.length - 1].GetId()
    : 0;

  // Mark the pack containing the winning tile
  if (winTileId > 0) {
    markWinningTilePacks(
      decompositions,
      winTileId,
      hand.packs.length,
      hand.context.zimo
    );
  }

  for (const packs of decompositions) {
    const acc = new FanAccumulator();
    countBasicFans(acc, hand, packs, 0);
    acc.applyExclusions();
    if (acc.getTotal() === 0) {
      acc.addFan(constants.FAN_WUFANHU);
    }

    if (acc.getTotal() > bestTotal) {
      bestTotal = acc.getTotal();
      bestResult = buildResult(acc, hand, packs);
    }
  }

  // 4. Try zuhelong decompositions
  if (zuhelongBitmap && !isBukao) {
    const zuhelongDecomps = enumerateZuhelongDecompositions(hand, zuhelongType);
    for (const { packs: decompPacks, zuhelongPack } of zuhelongDecomps) {
      const packs = [...hand.packs, ...decompPacks];
      markWinningTilePacks(
        [packs],
        winTileId,
        hand.packs.length,
        hand.context.zimo
      );
      const acc = new FanAccumulator();
      countBasicFans(acc, hand, packs, zuhelongType);
      acc.applyExclusions();

      if (acc.hasFan(constants.FAN_WUFANHU)) {
        acc.fanTable.delete(constants.FAN_WUFANHU);
      }

      const zlIdx = packs.indexOf(zuhelongPack);
      acc.addFan(constants.FAN_ZUHELONG, zlIdx >= 0 ? [zlIdx] : []);

      if (acc.getTotal() > bestTotal) {
        bestTotal = acc.getTotal();
        bestResult = buildResult(acc, hand, packs);
      }
    }
  }

  // 5. Add flower fans
  if (bestResult && hand.flowers && hand.flowers.length > 0) {
    for (let i = 0; i < hand.flowers.length; i++) {
      bestResult.fans.push({
        fanId: constants.FAN_HUAPAI,
        score: constants.FAN_SCORE[constants.FAN_HUAPAI],
        matchedPacks: []
      });
      bestResult.fanIds.push(constants.FAN_HUAPAI);
    }

    bestResult.totalFan += hand.flowers.length;
    bestResult.fanIds.sort((a, b) => a - b);
  }

  if (!bestResult) {
    return createEmptyFanResult();
  }

  return bestResult;
};

const countBasicFans = (acc, hand, packs, zuhelongType) => {
  countOverallAttrFans(acc, hand, packs, zuhelongType);
  countKeGangFans(acc, packs);
  countAssociatedCombinationFans(acc, packs);
  countSinglePackFans(acc, hand, packs);
  countWinModeFans(acc, hand, packs, zuhelongType);
};

const buildResult = (acc, hand, packs) => {
  const fans = acc.getFans();
  const fanIds = acc.getFanIds();
  const totalFan = acc.getTotal();

  return canonicalizeCandidate({
    isHu: true,
    totalFan,
    fanIds,
    fans,
    decomposition: packs ? { packs } : null
  });
};

module.exports = {
  evaluateFanRules
};
