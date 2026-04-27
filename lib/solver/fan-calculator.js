"use strict";

const { normalizeHandInput } = require("../api/normalize-hand");
const { evaluateFanRules } = require("./fan-rules");

class FanCalculator {
  count(input, overrides = {}) {
    const hand = normalizeHandInput(input, overrides);

    return evaluateFanRules(hand);
  }
}

module.exports = FanCalculator;
