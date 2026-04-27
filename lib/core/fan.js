/* eslint-disable camelcase, new-cap */
"use strict";

const constants = require("./constants");
const Pack = require("./pack");
const Tile = require("./tile");
const { runBridge } = require("./native-bridge");

const createFanTable = () =>
  Array.from({ length: constants.FAN_SIZE }, () => []);

class Fan {
  constructor() {
    this.fan_table = createFanTable();
    this.excluded_fan_table = createFanTable();
    this.fan_packs = [];
    this.tot_fan = 0;
    this.fan_table_res = createFanTable();
    this.fan_packs_res = [];
    this.tot_fan_res = 0;
  }

  JudgeHu(handtiles) {
    const result = runBridge("judge-hu", handtiles.HandtilesToString());
    if (!result.ok) {
      return 0;
    }

    return Number(result.header[1]);
  }

  JudgeHuTile(handtiles, tile) {
    handtiles.SetTile(tile);
    const result = this.JudgeHu(handtiles);
    handtiles.SetTile(constants.TILE_INVALID);
    return result;
  }

  CalcTing(handtiles, includeExhaustedTile = false) {
    const result = runBridge(
      "calc-ting",
      handtiles.HandtilesToString(),
      includeExhaustedTile ? "1" : "0"
    );
    if (!result.ok) {
      return [];
    }

    return result.header.slice(1).map(part => new Tile(Number(part)));
  }

  CountFan(handtiles) {
    this.fan_table = createFanTable();
    this.excluded_fan_table = createFanTable();
    this.fan_packs = [];
    this.fan_table_res = createFanTable();
    this.fan_packs_res = [];
    this.tot_fan = 0;
    this.tot_fan_res = 0;

    const result = runBridge("count-fan", handtiles.HandtilesToString());
    if (!result.ok) {
      return;
    }

    this.tot_fan = Number(result.header[1]);
    this.tot_fan_res = this.tot_fan;

    const packLine = result.lines[1]
      ? result.lines[1].trim().split(/\s+/)
      : ["PACKS"];
    this.fan_packs_res = packLine.slice(1).map(descriptor => {
      const [type, middleTile, zuhelongType, offer] = descriptor
        .split(",")
        .map(Number);
      return new Pack(type, new Tile(middleTile), zuhelongType, offer);
    });

    result.lines.slice(2).forEach(line => {
      if (!line.trim()) {
        return;
      }

      const parts = line
        .trim()
        .split(/\s+/)
        .map(Number);
      const fanId = parts[1];
      const packIds = parts.slice(2);
      this.fan_table_res[fanId].push(packIds);
    });
  }
}

module.exports = Fan;
