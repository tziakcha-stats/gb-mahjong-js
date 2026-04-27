"use strict";

const constants = require("../core/constants");

class WinContext {
  constructor(overrides = {}) {
    this.quanfeng = overrides.quanfeng ?? constants.TILE_E;
    this.menfeng = overrides.menfeng ?? constants.TILE_E;
    this.zimo = overrides.zimo ?? false;
    this.juezhang = overrides.juezhang ?? false;
    this.haidi = overrides.haidi ?? false;
    this.gang = overrides.gang ?? false;
  }
}

module.exports = WinContext;
