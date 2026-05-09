"use strict";
/* eslint-disable new-cap, no-multi-assign, max-params, complexity, no-return-assign, camelcase, max-depth */

const constants = require("../../core/constants");

const sizeUT = 34;
const sizeAT = 51;

const SeqArray = [
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0
];

function SeqCheck(i) {
  return i >= 0 && i < sizeUT ? SeqArray[i] : false;
}

function toTestIndex(id) {
  if (id >= 1 && id <= 9) return id - 1;
  if (id >= 10 && id <= 18) return id - 10 + 9;
  if (id >= 19 && id <= 27) return id - 19 + 18;
  if (id === 28) return 27;
  if (id === 29) return 28;
  if (id === 30) return 29;
  if (id === 31) return 30;
  if (id === 32) return 31;
  if (id === 33) return 32;
  if (id === 34) return 33;
  return 0;
}

function fromTestIndex(i) {
  if (i >= 0 && i <= 8) return i + 1;
  if (i >= 9 && i <= 17) return i - 9 + 10;
  if (i >= 18 && i <= 26) return i - 18 + 19;
  if (i === 27) return 28;
  if (i === 28) return 29;
  if (i === 29) return 30;
  if (i === 30) return 31;
  if (i === 31) return 32;
  if (i === 32) return 33;
  if (i === 33) return 34;
  return constants.TILE_INVALID;
}

function countTilesFromHand(handtiles) {
  const tiles = Array(sizeAT).fill(0);
  for (const tile of handtiles.lipai) {
    const id = tile.GetId();
    if (id === constants.TILE_INVALID) continue;
    if (id >= constants.TILE_MEI && id <= constants.TILE_DONG) continue;
    tiles[toTestIndex(id)]++;
  }

  return tiles;
}

function countFuluTiles(handtiles) {
  const used = Array(sizeUT).fill(0);
  for (const pack of handtiles.fulu) {
    const all = pack.GetAllTile();
    for (const tile of all) {
      const idx = toTestIndex(tile.GetId());
      if (idx >= 0 && idx < sizeUT) used[idx]++;
    }
  }

  return used;
}

const JokerA = [
  43,
  43,
  43,
  43,
  43,
  43,
  43,
  43,
  43,
  44,
  44,
  44,
  44,
  44,
  44,
  44,
  44,
  44,
  45,
  45,
  45,
  45,
  45,
  45,
  45,
  45,
  45,
  47,
  47,
  47,
  47,
  48,
  48,
  48,
  50,
  50,
  50,
  50,
  50,
  50,
  50,
  50,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50
];

const JokerB = [
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  46,
  49,
  49,
  49,
  49,
  49,
  49,
  49,
  50,
  50,
  50,
  50,
  50,
  50,
  50,
  50,
  42,
  46,
  46,
  46,
  46,
  49,
  49,
  49,
  50
];

const JokerC = 42;

let step = [];
let ldStep;
let lastStep = { nm: -1, np: -1, glmt: -1, tiles: null, sup: -1, guse: null };
let INF = Infinity;
const EMPTY = -2;
let vst = [];
let vstLen = 0;
const guseall = Array(sizeAT).fill(0);

function prepareStep(nm, np, tiles) {
  ldStep = Array(sizeUT * 7);
  let sizeStep = 0;
  for (let i = 0; i < sizeUT; ++i) {
    const l = i * 7;
    ldStep[l] = sizeStep;
    ldStep[l + 1] = tiles[JokerC] + 1;
    ldStep[l + 2] = ldStep[l + 1] * (tiles[JokerB[i]] + 1);
    ldStep[l + 3] = ldStep[l + 2] * (tiles[JokerA[i]] + 1);
    let mui = 0;
    let muj = 0;
    if (SeqCheck(i - 1)) mui = muj = 2;
    if (SeqCheck(i - 2)) mui += 2;
    ldStep[l + 4] = ldStep[l + 3] * (muj + 1);
    ldStep[l + 5] = ldStep[l + 4] * (mui + 1);
    ldStep[l + 6] = ldStep[l + 5] * (np + 1);
    sizeStep += ldStep[l + 6] * (nm + 1);
  }

  if (sizeStep > step.length) {
    step = new Int32Array(sizeStep).fill(EMPTY);
  } else {
    for (let i = 0; i < vstLen; ++i) step[vst[i]] = EMPTY;
  }

  vstLen = 0;
}

function indexStep(em, ep, i, ui, uj, aj, bj, cj) {
  const l = i * 7;
  return (
    ldStep[l] +
    em * ldStep[l + 6] +
    ep * ldStep[l + 5] +
    ui * ldStep[l + 4] +
    uj * ldStep[l + 3] +
    aj * ldStep[l + 2] +
    bj * ldStep[l + 1] +
    cj
  );
}

function kernelStep(
  tiles,
  em,
  ep,
  nm,
  np,
  sup,
  glmt,
  guse,
  i = 0,
  ui = 0,
  uj = 0,
  aj = 0,
  bj = 0,
  cj = 0
) {
  if (i >= sizeUT) return (nm - em) * 3 + (np - ep) * 2 - 1;
  const dpi = indexStep(em, ep, i, ui, uj, aj, bj, cj);
  if (step[dpi] !== EMPTY) return step[dpi];
  if (vstLen >= vst.length) vst.push(dpi);
  else vst[vstLen] = dpi;
  vstLen++;
  if (guse[i] === Infinity)
    return (step[dpi] = kernelStep(
      tiles,
      em,
      ep,
      nm,
      np,
      sup,
      glmt,
      guse,
      i + 1,
      uj,
      0,
      aj,
      bj,
      cj
    ));
  let lmti = glmt - guse[i];
  let ra = tiles[JokerA[i]] - aj;
  let rb = tiles[JokerB[i]] - bj;
  let rc = tiles[JokerC] - cj;
  const cs =
    SeqCheck(i) && guse[i + 1] !== Infinity && guse[i + 2] !== Infinity;
  const csi =
    glmt === Infinity && cs && SeqCheck(i + 1) && guse[i + 3] !== Infinity;
  let nxti;
  for (nxti = i + 1; nxti < sizeUT; ++nxti) if (guse[nxti] !== Infinity) break;
  let ei = tiles[i];
  if (JokerA[i] !== JokerA[nxti]) {
    ei += ra;
    lmti += ra;
    ra = aj = 0;
  }

  if (JokerB[i] !== JokerB[nxti]) {
    ei += rb;
    lmti += rb;
    rb = bj = 0;
  }

  if (nxti >= sizeUT) {
    ei += rc;
    lmti += rc;
    rc = cj = 0;
  }

  const ri = Math.max(ei - ui, 0);
  const rj = Math.max((i + 1 < sizeUT ? tiles[i + 1] : 0) - uj, 0);
  const lmtj = lmti + ra + rb + rc;
  if (ui > lmtj) return (step[dpi] = INF);
  let ans = INF;
  const mp = Math.min(np - ep, ri);
  const ms = cs ? Math.min(nm - em, 2) : 0;
  for (let p = 0; p <= mp; ++p)
    for (let s = 0; s <= ms; ++s) {
      const lri = lmtj - ui - p * 2 - s;
      if (
        lri < 0 ||
        (s &&
          p * 2 + s > ri &&
          (csi || (s > rj && s > (i + 2 < sizeUT ? tiles[i + 2] : 0))))
      )
        break;
      let kri = Math.max(ri - p * 2 - s, 0);
      let mmk = Math.floor(kri / 3);
      let pmk = Math.ceil(kri / 3);
      const rgk = Math.min(nm - em - s, Math.floor(lri / 3));
      mmk = Math.min(mmk, rgk);
      pmk = Math.min(pmk, rgk);
      for (let k = mmk; k <= pmk; ++k) {
        const ti = p * 2 + s + k * 3 + ui;
        let d = Math.max(ti - ei, 0);
        if (glmt === Infinity) {
          const uaj = Math.min(ra, d);
          d -= uaj;
          const ubj = Math.min(rb, d);
          d -= ubj;
          const ucj = Math.min(rc, d);
          d -= ucj;
          if (d - 1 >= Math.min(ans, sup)) break;
          ans = Math.min(
            ans,
            kernelStep(
              tiles,
              em + s + k,
              ep + p,
              nm,
              np,
              sup,
              glmt,
              guse,
              i + 1,
              s + uj,
              s,
              aj + uaj,
              bj + ubj,
              cj + ucj
            ) + d
          );
        } else {
          const el = Math.max(ti - lmti, 0);
          const er = Math.min(ra + rb + rc, d);
          for (let e = er; e >= el; --e) {
            const uaj = Math.min(ra, e);
            const ubj = Math.min(rb, e - uaj);
            const ucj = Math.min(rc, e - uaj - ubj);
            if (d - e - 1 >= Math.min(ans, sup)) break;
            ans = Math.min(
              ans,
              kernelStep(
                tiles,
                em + s + k,
                ep + p,
                nm,
                np,
                sup,
                glmt,
                guse,
                i + 1,
                s + uj,
                s,
                aj + uaj,
                bj + ubj,
                cj + ucj
              ) +
                d -
                e
            );
          }
        }
      }
    }

  return (step[dpi] = ans);
}

function searchDp(
  tiles,
  em,
  ep,
  tcnt,
  sup = Infinity,
  glmt = Infinity,
  guse = guseall
) {
  tiles = tiles.slice();
  let nm = (tcnt / 3) | 0;
  let np = Number(nm * 3 !== tcnt);
  INF = nm * 3 + np * 2 - 1;
  for (let i = 0; i < sizeUT; ++i) {
    tiles[i] = Math.min(tiles[i], glmt);
    const km = Math.min(Math.floor(Math.max(tiles[i] - 8, 0) / 3), nm - em);
    nm -= km;
    tiles[i] -= km * 3;
  }

  if (glmt !== Infinity) {
    if (!useStepMemory(nm, np, tiles, glmt, sup, guse))
      prepareStep(nm, np, tiles);
    lastStep.nm = nm;
    lastStep.np = np;
    lastStep.glmt = glmt;
    lastStep.tiles = tiles;
    lastStep.sup = sup;
    lastStep.guse = guse;
    return kernelStep(tiles, em, ep, nm, np, sup, glmt, guse);
  }

  let ans = -tiles[JokerC];
  tiles[JokerC] = 0;
  if (!useStepMemory(nm, np, tiles, glmt, sup, guse))
    prepareStep(nm, np, tiles);
  lastStep.nm = nm;
  lastStep.np = np;
  lastStep.glmt = glmt;
  lastStep.tiles = tiles;
  lastStep.sup = sup;
  lastStep.guse = guse;
  return kernelStep(tiles, em, ep, nm, np, sup - ans, glmt, guse) + ans;
}

function useStepMemory(nm, np, tiles, glmt, sup, guse) {
  if (nm !== lastStep.nm) return false;
  if (np !== lastStep.np) return false;
  if (glmt !== lastStep.glmt) return false;
  if (glmt !== Infinity) {
    if (tiles[JokerC] !== lastStep.tiles[JokerC]) return false;
    if (sup > lastStep.sup) return false;
  }

  if (
    glmt === Infinity &&
    sup + tiles[JokerC] > lastStep.sup + lastStep.tiles[JokerC]
  )
    return false;
  let last_same = 0;
  for (let i = 0; i < sizeUT; ++i) {
    if (tiles[JokerA[i]] !== lastStep.tiles[JokerA[i]]) return false;
    if (tiles[JokerB[i]] !== lastStep.tiles[JokerB[i]]) return false;
    if (tiles[i] !== lastStep.tiles[i]) last_same = i + 1;
    if (guse[i] !== lastStep.guse[i]) last_same = i + 1;
  }

  if (last_same === sizeUT) return false;
  const end = indexStep(0, 0, last_same, 0, 0, 0, 0, 0);
  let newLen = 0;
  for (let i = 0; i < vstLen; ++i) {
    if (vst[i] < end) step[vst[i]] = EMPTY;
    else {
      vst[newLen] = vst[i];
      newLen++;
    }
  }

  vstLen = newLen;
  return true;
}

module.exports = {
  sizeUT,
  sizeAT,
  SeqArray,
  SeqCheck,
  toTestIndex,
  fromTestIndex,
  countTilesFromHand,
  countFuluTiles,
  JokerA,
  JokerB,
  JokerC,
  prepareStep,
  indexStep,
  kernelStep,
  searchDp,
  useStepMemory,
  EMPTY,
  guseall
};
