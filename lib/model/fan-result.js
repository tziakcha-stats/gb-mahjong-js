"use strict";

class FanResult {
  constructor(overrides = {}) {
    this.isHu = overrides.isHu ?? false;
    this.totalFan = overrides.totalFan ?? overrides.total ?? 0;
    this.fanIds = overrides.fanIds ?? [];
    this.fans = overrides.fans ?? [];
    this.decomposition = overrides.decomposition ?? null;
  }

  get total() {
    return this.totalFan;
  }

  get packs() {
    return this.decomposition?.packs ?? [];
  }
}

module.exports = FanResult;
