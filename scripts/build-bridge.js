"use strict";

const { ensureBridge } = require("../lib/core/native-bridge");

ensureBridge();
console.log("bridge ready");
