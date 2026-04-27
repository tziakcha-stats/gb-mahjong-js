/* eslint-disable new-cap */
"use strict";

const constants = require("../core/constants");
const Handtiles = require("../core/handtiles");
const Pack = require("../core/pack");
const Tile = require("../core/tile");
const Hand = require("../model/hand");
const WinContext = require("../model/win-context");

const cloneTile = tile =>
  tile instanceof Tile ? tile.clone() : new Tile(tile);

const clonePack = pack =>
  new Pack(
    pack.GetType(),
    cloneTile(pack.GetMiddleTile()),
    pack.GetZuhelongType(),
    pack.GetOffer()
  );

const inferWinningTile = legacy => {
  const lastTile = legacy.GetLastLipai();

  if (!legacy.HasWinningTile() || !lastTile) {
    return null;
  }

  return lastTile.clone();
};

const handFromLegacy = legacy =>
  new Hand({
    tiles: legacy.lipai
      .filter(tile => tile.GetId() !== constants.TILE_INVALID)
      .map(cloneTile),
    packs: legacy.fulu.map(clonePack),
    winningTile: inferWinningTile(legacy),
    flowers: legacy.huapai.map(cloneTile),
    context: new WinContext({
      quanfeng: legacy.GetQuanfeng(),
      menfeng: legacy.GetMenfeng(),
      zimo: Boolean(legacy.IsZimo()),
      juezhang: Boolean(legacy.IsJuezhang()),
      haidi: Boolean(legacy.IsHaidi()),
      gang: Boolean(legacy.IsGang())
    }),
    source: legacy.HandtilesToString()
  });

const legacyFromHand = input => {
  const hand = input instanceof Hand ? input : new Hand(input);
  const legacy = new Handtiles();

  legacy.fulu = hand.packs.map(clonePack);
  legacy.huapai = hand.flowers.map(cloneTile);
  legacy.lipai = hand.tiles.map(cloneTile);

  if (
    hand.winningTile === null &&
    legacy.fulu.length * 3 + legacy.lipai.length === 13
  ) {
    legacy.lipai.push(new Tile());
  } else if (
    hand.winningTile !== null &&
    legacy.fulu.length * 3 + legacy.lipai.length === 13
  ) {
    legacy.lipai.push(cloneTile(hand.winningTile));
  }

  legacy.SetQuanfeng(hand.context.quanfeng);
  legacy.SetMenfeng(hand.context.menfeng);
  legacy.SetZimo(Number(Boolean(hand.context.zimo)));
  legacy.SetJuezhang(Number(Boolean(hand.context.juezhang)));
  legacy.SetHaidi(Number(Boolean(hand.context.haidi)));
  legacy.SetGang(Number(Boolean(hand.context.gang)));
  legacy._GenerateTable();

  return legacy;
};

module.exports = {
  handFromLegacy,
  legacyFromHand,
  normalizeHonorSuit: input =>
    input.replace(/([1-7]+)z/g, (_, digits) =>
      digits
        .split("")
        .map(
          digit =>
            ({
              "1": "E",
              "2": "S",
              "3": "W",
              "4": "N",
              "5": "C",
              "6": "F",
              "7": "P"
            }[digit] ?? digit)
        )
        .join("")
    )
};
