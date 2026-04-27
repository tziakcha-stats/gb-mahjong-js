"use strict";

const WinContext = require("./win-context");

class Hand {
  constructor(overrides = {}) {
    this.tiles = overrides.tiles ?? [];
    this.packs = overrides.packs ?? [];
    this.winningTile = overrides.winningTile ?? null;
    this.flowers = overrides.flowers ?? [];
    this.context =
      overrides.context instanceof WinContext
        ? overrides.context
        : new WinContext(overrides.context);
    this.source = overrides.source ?? null;
  }
}

module.exports = Hand;
