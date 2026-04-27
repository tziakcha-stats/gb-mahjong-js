"use strict";

class HandParseError extends Error {
  constructor(code, input) {
    super(`Failed to parse hand: ${code}`);
    this.name = "HandParseError";
    this.code = code;
    this.input = input;
  }
}

module.exports = {
  HandParseError
};
