/* eslint-disable new-cap */
"use strict";

const constants = require("../core/constants");
const { normalizeHandInput } = require("../api/normalize-hand");
const { enumerateDecompositions } = require("./decomposition");
const {
  canonicalizeCandidate,
  createEmptyFanResult
} = require("./fan-optimizer");

const isKezi = pack => pack.type === constants.PACK_TYPE_KEZI;
const isGang = pack => pack.type === constants.PACK_TYPE_GANG;
const isKeGang = pack => isKezi(pack) || isGang(pack);
const isJiang = pack => pack.type === constants.PACK_TYPE_JIANG;
const isShunzi = pack => pack.type === constants.PACK_TYPE_SHUNZI;
const isAnshou = pack => pack.offer === 0 || pack.offer === -1;
const tileIdOf = tile =>
  typeof tile.GetId === "function" ? tile.GetId() : tile;
const isWindTile = tileId =>
  tileId >= constants.TILE_E && tileId <= constants.TILE_N;
const isDragonTile = tileId =>
  tileId >= constants.TILE_C && tileId <= constants.TILE_P;
const isHonorTile = tileId =>
  tileId >= constants.TILE_E && tileId <= constants.TILE_P;
const isNumberedTile = tileId =>
  tileId >= constants.TILE_1m && tileId <= constants.TILE_9p;

const expandPackTileIds = pack => {
  const tileId = tileIdOf(pack.tile);

  if (isShunzi(pack)) {
    return [tileId - 1, tileId, tileId + 1];
  }

  if (isGang(pack)) {
    return [tileId, tileId, tileId, tileId];
  }

  if (isKezi(pack)) {
    return [tileId, tileId, tileId];
  }

  if (isJiang(pack)) {
    return [tileId, tileId];
  }

  return [];
};

const collectTileIds = packs =>
  packs.flatMap(pack => expandPackTileIds(pack)).filter(Boolean);

const addFan = (fans, fanId, matchedPacks = []) => {
  fans.push({
    fanId,
    score: constants.FAN_SCORE[fanId],
    matchedPacks: matchedPacks.slice().sort((left, right) => left - right)
  });
};

const excludeFan = (fans, fanId) => fans.filter(fan => fan.fanId !== fanId);

const applyOverallFans = (hand, packs, fans) => {
  const tileIds = collectTileIds(packs);
  const numberedTiles = tileIds.filter(isNumberedTile);
  const honorTiles = tileIds.filter(isHonorTile);

  if (numberedTiles.length > 0 && honorTiles.length > 0) {
    const suits = new Set(
      numberedTiles.map(tileId => constants.TILES_SUIT[tileId])
    );

    if (suits.size === 1) {
      addFan(fans, constants.FAN_HUNYISE);
    }
  }

  if (packs.every(pack => isKeGang(pack) || isJiang(pack))) {
    addFan(fans, constants.FAN_PENGPENGHU);
  }

  return fans;
};

const applyKeGangFans = (packs, fans) => {
  const minggang = [];
  const anke = [];

  packs.forEach((pack, index) => {
    if (isGang(pack) && !isAnshou(pack)) {
      minggang.push(index);
    } else if (isKezi(pack) && isAnshou(pack)) {
      anke.push(index);
    }
  });

  if (minggang.length === 1) {
    addFan(fans, constants.FAN_MINGGANG, minggang);
  }

  if (anke.length >= 2) {
    addFan(fans, constants.FAN_SHUANGANKE, anke.slice(0, 2));
  }

  return fans;
};

const applyAssociatedCombinationFans = packs => {
  const fans = [];
  const windKeGang = [];

  packs.forEach((pack, index) => {
    if (isKeGang(pack) && isWindTile(tileIdOf(pack.tile))) {
      windKeGang.push(index);
    }
  });

  if (windKeGang.length === 4) {
    addFan(fans, constants.FAN_DASIXI, windKeGang);
    return fans;
  }

  if (windKeGang.length === 3) {
    addFan(fans, constants.FAN_SANFENGKE, windKeGang);
  }

  return fans;
};

const applySinglePackFans = (hand, packs, fans) => {
  packs.forEach((pack, index) => {
    const tileId = tileIdOf(pack.tile);

    if (!isKeGang(pack)) {
      return;
    }

    if (isDragonTile(tileId)) {
      addFan(fans, constants.FAN_JIANKE, [index]);
    }

    if (tileId === hand.context.quanfeng) {
      addFan(fans, constants.FAN_QUANFENGKE, [index]);
    }

    if (tileId === hand.context.menfeng) {
      addFan(fans, constants.FAN_MENFENGKE, [index]);
    }
  });

  return fans;
};

const applyWinModeFans = (hand, fans) => {
  if (hand.context.gang && hand.context.zimo) {
    addFan(fans, constants.FAN_GANGSHANGKAIHUA);
    return excludeFan(fans, constants.FAN_ZIMO);
  }

  if (hand.context.gang && !hand.context.zimo) {
    addFan(fans, constants.FAN_QIANGGANGHU);
  }

  if (hand.context.zimo) {
    addFan(fans, constants.FAN_ZIMO);
  }

  return fans;
};

const applyExclusions = (packs, fans) => {
  const hasDasixi = fans.some(fan => fan.fanId === constants.FAN_DASIXI);

  if (!hasDasixi) {
    return fans;
  }

  return fans.filter(fan => {
    if (fan.fanId === constants.FAN_PENGPENGHU) {
      return false;
    }

    if (fan.fanId === constants.FAN_QUANFENGKE) {
      return !fan.matchedPacks.some(index =>
        isWindTile(tileIdOf(packs[index].tile))
      );
    }

    if (fan.fanId === constants.FAN_MENFENGKE) {
      return !fan.matchedPacks.some(index =>
        isWindTile(tileIdOf(packs[index].tile))
      );
    }

    return fan.fanId !== constants.FAN_SANFENGKE;
  });
};

const sumFanScore = fans =>
  fans.reduce((total, fan) => total + constants.FAN_SCORE[fan.fanId], 0);

const evaluateFanRules = (input, overrides = {}) => {
  const hand = normalizeHandInput(input, overrides);
  const decompositions = enumerateDecompositions(hand);

  if (decompositions.length === 0) {
    return createEmptyFanResult();
  }

  const packs = decompositions[0];
  let fans = [];

  fans = fans.concat(applyAssociatedCombinationFans(packs));
  fans = applyOverallFans(hand, packs, fans);
  fans = applyKeGangFans(packs, fans);
  fans = applySinglePackFans(hand, packs, fans);
  fans = applyWinModeFans(hand, fans);
  fans = applyExclusions(packs, fans);

  const candidate = canonicalizeCandidate({
    isHu: true,
    totalFan: sumFanScore(fans),
    fanIds: fans.map(fan => fan.fanId),
    fans,
    decomposition: { packs }
  });

  return {
    ...candidate,
    totalFan: sumFanScore(candidate.fans),
    fanIds: candidate.fans
      .map(fan => fan.fanId)
      .slice()
      .sort((left, right) => left - right)
  };
};

module.exports = {
  evaluateFanRules
};
