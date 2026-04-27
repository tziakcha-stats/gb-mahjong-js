/* eslint-disable new-cap */
"use strict";

const FanResult = require("../model/fan-result");
const DecompositionPack = require("../model/decomposition-pack");

const tileIdOf = tile =>
  tile && typeof tile.GetId === "function" ? tile.GetId() : tile;

const packSignature = pack =>
  [
    pack.type ?? null,
    tileIdOf(pack.tile) ?? null,
    pack.offer ?? 0,
    pack.zuhelong ?? 0
  ].join(":");

const normalizePack = pack =>
  pack instanceof DecompositionPack ? pack : new DecompositionPack(pack);

const normalizeMatchedPacks = (matchedPacks, remap) =>
  (matchedPacks ?? [])
    .map(index => remap.get(index))
    .filter(index => index !== undefined)
    .sort((left, right) => left - right);

const createEmptyFanResult = () =>
  new FanResult({
    isHu: false,
    totalFan: 0,
    fanIds: [],
    fans: [],
    decomposition: null
  });

const canonicalizeCandidate = candidate => {
  const packs = (candidate.decomposition?.packs ?? []).map(normalizePack);
  const indexedPacks = packs.map((pack, index) => ({
    index,
    pack,
    signature: packSignature(pack)
  }));

  indexedPacks.sort((left, right) =>
    left.signature.localeCompare(right.signature)
  );

  const remap = new Map(
    indexedPacks.map((entry, normalizedIndex) => [entry.index, normalizedIndex])
  );

  return new FanResult({
    isHu: candidate.isHu ?? true,
    totalFan: candidate.totalFan ?? candidate.total ?? 0,
    fanIds: (candidate.fanIds ?? [])
      .slice()
      .sort((left, right) => left - right),
    fans: (candidate.fans ?? []).map(fan => ({
      ...fan,
      matchedPacks: normalizeMatchedPacks(fan.matchedPacks, remap)
    })),
    decomposition: candidate.decomposition
      ? {
          ...candidate.decomposition,
          packs: indexedPacks.map(entry => entry.pack)
        }
      : null
  });
};

module.exports = {
  canonicalizeCandidate,
  createEmptyFanResult,
  packSignature
};
