"use strict";

const { normalizeHandInput } = require("../api/normalize-hand");
const { enumerateDecompositions } = require("./decomposition");
const { hasSpecialHu } = require("./special-hu");

const judgeHu = (input, options = {}) => {
  const hand = normalizeHandInput(input, options);

  return enumerateDecompositions(hand).length > 0 || hasSpecialHu(hand);
};

module.exports = {
  judgeHu,
  hasSpecialHu,
  normalizeHandInput
};
