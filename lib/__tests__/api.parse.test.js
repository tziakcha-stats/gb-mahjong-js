/* eslint-disable new-cap */
"use strict";

const {
  parseHand,
  formatHand,
  HandParseError,
  constants
} = require("../index");

test("parseHand builds Hand with context and winningTile", () => {
  const hand = parseHand("[EEE,2][SSSS,1]WWWNN55pN|EE1000");

  expect(hand.winningTile.GetId()).toBeGreaterThan(0);
  expect(hand.context.quanfeng).toBe(constants.TILE_E);
});

test("parseHand keeps winningTile null for 13-tile ting inputs", () => {
  const hand = parseHand("123m123p123s77z99m|EE0000");

  expect(hand.winningTile).toBe(null);
});

test("formatHand preserves the normalized protocol string", () => {
  const hand = parseHand(" 345 s3pFF5 567p[789m]4p ");

  expect(formatHand(hand)).toBe("[789m,1]345s35567pFF4p|EE0000|");
});

test("parseHand throws HandParseError with legacy code", () => {
  expect(() => parseHand("345s35[55567p[789m]4p")).toThrow(HandParseError);

  try {
    parseHand("345s35[55567p[789m]4p");
  } catch (error) {
    expect(error.code).toBe(-1);
  }
});
