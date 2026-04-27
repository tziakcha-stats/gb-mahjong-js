"use strict";

const Tile = require("../core/tile");
const Pack = require("../core/pack");
const Hand = require("../model/hand");
const WinContext = require("../model/win-context");
const FanResult = require("../model/fan-result");
const DecompositionPack = require("../model/decomposition-pack");
const FanCalculator = require("../solver/fan-calculator");
const { judgeHu: judgeHuSolver } = require("../solver/judge-hu");
const {
  judgeHuTile: judgeHuTileSolver,
  calcTing: calcTingSolver
} = require("../solver/calc-ting");
const parseHand = require("../parser/parse-hand");
const formatHand = require("../parser/format-hand");
const { HandParseError } = require("../parser/errors");

const judgeHu = (input, overrides = {}) => {
  return judgeHuSolver(input, overrides);
};

const judgeHuTile = (input, tile, overrides = {}) => {
  return judgeHuTileSolver(input, tile, overrides);
};

const calcTing = (input, options = {}) => {
  return calcTingSolver(input, options);
};

const countFan = (input, options = {}) => {
  const calculator = new FanCalculator();

  return calculator.count(input, options);
};

module.exports = {
  HandParseError,
  parseHand,
  formatHand,
  judgeHu,
  judgeHuTile,
  calcTing,
  countFan,
  Tile,
  Pack,
  Hand,
  WinContext,
  FanResult,
  DecompositionPack,
  FanCalculator
};
