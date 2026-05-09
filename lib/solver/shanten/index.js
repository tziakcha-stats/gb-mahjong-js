"use strict";
/* eslint-disable new-cap, max-params */

const { sizeUT, countTilesFromHand, countFuluTiles } = require("./utils");
const { Step } = require("./normal");
const { PairStep } = require("./qidui");
const { OrphanStep } = require("./shisanyao");
const { Bukao16Count } = require("./quanbukao");
const { KnitDragonStep } = require("./zuhelong");

function bestStepAll(tiles, tcnt, en) {
  let a = Infinity;
  let b = Infinity;
  let c = Infinity;
  let d = Infinity;
  let e = Infinity;
  if (en.normal !== false) a = Step(tiles, tcnt);
  if (en.qidui !== false && (tcnt === 13 || tcnt === 14)) b = PairStep(tiles);
  if (en.shisanyao !== false) c = OrphanStep(tiles);
  if (en.quanbukao !== false && tcnt === 14) d = tcnt - 1 - Bukao16Count(tiles);
  if (en.zuhelong !== false && tcnt >= 9) e = KnitDragonStep(tiles, tcnt);
  return Math.min(a, b, c, d, e);
}

function computeWaitsCross(tiles, tcnt, usedAll, remain, en) {
  const waits = [];
  const base = bestStepAll(tiles, tcnt, en);
  for (let i = 0; i < sizeUT; ++i) {
    if (!tiles[i]) continue;
    tiles[i]--;
    const shAfter = bestStepAll(tiles, tcnt - 1, en);
    const waitList = [];
    let total = 0;
    for (let j = 0; j < sizeUT; ++j) {
      const pre = tiles[j];
      const cap = (remain ? remain[j] : 4) - (usedAll ? usedAll[j] : 0) - pre;
      if (cap <= 0) continue;
      tiles[j]++;
      const ns = bestStepAll(tiles, tcnt, en);
      tiles[j]--;
      if (ns < base) {
        waitList.push(j);
        total += cap;
      }
    }

    tiles[i]++;
    if (waitList.length)
      waits.push({
        discard: i,
        tiles: waitList,
        count: total,
        shanten: shAfter
      });
  }

  return waits;
}

function patternShanten(tiles, tcnt, p) {
  if (p === "normal") return Step(tiles, tcnt);
  if (p === "qidui")
    return tcnt === 13 || tcnt === 14 ? PairStep(tiles) : Infinity;
  if (p === "shisanyao")
    return tcnt === 13 || tcnt === 14 ? OrphanStep(tiles) : Infinity;
  if (p === "quanbukao")
    return tcnt === 14 ? tcnt - 1 - Bukao16Count(tiles) : Infinity;
  if (p === "zuhelong")
    return tcnt >= 9 ? KnitDragonStep(tiles, tcnt) : Infinity;
  return Infinity;
}

function buildPatternDetails(tiles, tcnt, usedAll, remain, en) {
  const pats = ["normal", "qidui", "shisanyao", "quanbukao", "zuhelong"];
  const out = {};
  for (const p of pats) {
    if (!en[p]) {
      out[p] = { perDiscard: [] };
      continue;
    }

    if (p === "quanbukao" && tcnt !== 14) {
      out[p] = { perDiscard: [] };
      continue;
    }

    if ((p === "qidui" || p === "shisanyao") && !(tcnt === 13 || tcnt === 14)) {
      out[p] = { perDiscard: [] };
      continue;
    }

    if (p === "zuhelong" && tcnt < 9) {
      out[p] = { perDiscard: [] };
      continue;
    }

    const perDiscard = [];
    for (let i = 0; i < sizeUT; ++i) {
      if (!tiles[i]) continue;
      tiles[i]--;
      const base = patternShanten(tiles, tcnt - 1, p);
      const waits = [];
      let count = 0;
      for (let j = 0; j < sizeUT; ++j) {
        const cap =
          (remain ? remain[j] : 4) - (usedAll ? usedAll[j] : 0) - tiles[j];
        if (cap <= 0) continue;
        tiles[j]++;
        const ns = patternShanten(tiles, tcnt, p);
        tiles[j]--;
        if (ns < base) {
          waits.push(j);
          count += cap;
        }
      }

      tiles[i]++;
      perDiscard.push({ discard: i, shanten: base, tiles: waits, count });
    }

    out[p] = { perDiscard };
  }

  return out;
}

class Shanten {
  static calcAll(handtiles, opt = {}) {
    const tiles = countTilesFromHand(handtiles);
    const usedF = countFuluTiles(handtiles);
    let tcnt = 0;
    for (let i = 0; i < sizeUT; ++i) tcnt += tiles[i];

    const en = {
      normal: true,
      qidui: true,
      shisanyao: true,
      quanbukao: true,
      zuhelong: true
    };
    if (Array.isArray(opt.modes)) {
      for (const k of Object.keys(en)) en[k] = opt.modes.includes(k);
    }

    if (handtiles.fulu && handtiles.fulu.length) {
      en.qidui = false;
      en.shisanyao = false;
      en.quanbukao = false;
    }

    const normal = en.normal ? Step(tiles, tcnt) : Infinity;
    const qidui = en.qidui ? PairStep(tiles) : Infinity;
    const shisanyao = en.shisanyao ? OrphanStep(tiles) : Infinity;
    const quanbukao =
      en.quanbukao && tcnt === 14 ? tcnt - 1 - Bukao16Count(tiles) : Infinity;
    const zuhelong =
      en.zuhelong && tcnt >= 9 ? KnitDragonStep(tiles, tcnt) : Infinity;

    let waits = [];
    if (tcnt === 14 || tcnt === 13) {
      waits = computeWaitsCross(tiles, tcnt, usedF, opt.remain, en);
    }

    const details = buildPatternDetails(tiles, tcnt, usedF, opt.remain, en);

    return { normal, qidui, shisanyao, quanbukao, zuhelong, waits, details };
  }
}

module.exports = { Shanten };
