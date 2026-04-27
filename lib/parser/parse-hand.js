/* eslint-disable new-cap */
"use strict";

const Handtiles = require("../core/handtiles");
const { HandParseError } = require("./errors");
const { handFromLegacy, normalizeHonorSuit } = require("./legacy-adapter");

const parseHand = input => {
  const legacy = new Handtiles();
  const normalizedInput = normalizeHonorSuit(String(input ?? ""));
  const code = legacy.StringToHandtiles(normalizedInput);

  if (code !== 0) {
    throw new HandParseError(code, input);
  }

  return handFromLegacy(legacy);
};

module.exports = parseHand;
