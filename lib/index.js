"use strict";

const constants = require("./core/constants");
const Tile = require("./core/tile");
const Pack = require("./core/pack");
const Handtiles = require("./core/handtiles");
const api = require("./api");

const runtime = {
  ...constants,
  ...api,
  constants,
  Tile,
  Pack,
  Handtiles
};

Object.defineProperty(runtime, "Fan", {
  enumerable: true,
  get() {
    return require("./core/fan");
  }
});

Object.defineProperty(runtime, "Shanten", {
  enumerable: true,
  get() {
    return require("./solver/shanten").Shanten;
  }
});

module.exports = runtime;
