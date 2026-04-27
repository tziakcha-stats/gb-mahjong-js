"use strict";

class DecompositionPack {
  constructor(overrides = {}) {
    this.type = overrides.type ?? null;
    this.tile = overrides.tile ?? null;
    this.offer = overrides.offer ?? 0;
    this.zuhelong = overrides.zuhelong ?? overrides.zuhelongType ?? 0;
  }
}

module.exports = DecompositionPack;
