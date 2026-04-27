/* eslint-disable new-cap */
"use strict";

const { legacyFromHand } = require("./legacy-adapter");

const formatHand = input => legacyFromHand(input).HandtilesToString();

module.exports = formatHand;
