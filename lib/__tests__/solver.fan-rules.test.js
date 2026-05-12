"use strict";

const { constants, parseHand } = require("../index");
const { evaluateFanRules } = require("../solver/fan-rules");
const { fanCases } = require("../test-data/unit-test-cases");

const mapNamesToValues = names =>
  names.map(name => constants[name]).sort((a, b) => a - b);
const totalFan = fanIds =>
  fanIds.reduce((sum, fanId) => sum + constants.FAN_SCORE[fanId], 0);

describe("fan rules (JS engine)", () => {
  test("matches Dasixi from a normalized decomposition", () => {
    const result = evaluateFanRules(
      parseHand("[EEE,2][SSSS,1]WWWNN55pN|EE1000")
    );

    expect(result.fanIds).toContain(constants.FAN_DASIXI);
  });

  test("matches supporting fans for the big four winds sample", () => {
    const result = evaluateFanRules(
      parseHand("[EEE,2][SSSS,1]WWWNN55pN|EE1000")
    );

    expect(result.fanIds).toEqual(
      expect.arrayContaining([
        constants.FAN_DASIXI,
        constants.FAN_HUNYISE,
        constants.FAN_SHUANGANKE,
        constants.FAN_MINGGANG,
        constants.FAN_ZIMO
      ])
    );
  });

  test("excludes lower-priority fan entries when a higher combination applies", () => {
    const result = evaluateFanRules(
      parseHand("[EEE,2][SSSS,1]WWWNN55pN|EE1000")
    );

    expect(result.fanIds).not.toContain(constants.FAN_SANFENGKE);
    expect(result.fanIds).not.toContain(constants.FAN_PENGPENGHU);
    expect(result.fanIds).not.toContain(constants.FAN_QUANFENGKE);
  });

  test("context-sensitive fan rules respect explicit context flags for qiangganghu", () => {
    const hand = parseHand("[CCCC][FFFF][PPPP][NNNN]EE");
    const result = evaluateFanRules(hand, { zimo: false, gang: true });

    expect(result.fanIds).toContain(constants.FAN_QIANGGANGHU);
    expect(result.fanIds).not.toContain(constants.FAN_GANGSHANGKAIHUA);
  });

  test("context-sensitive fan rules respect explicit context flags for gangshangkaihua", () => {
    const hand = parseHand("[CCCC][FFFF][PPPP][NNNN]EE");
    const result = evaluateFanRules(hand, { zimo: true, gang: true });

    expect(result.fanIds).toContain(constants.FAN_GANGSHANGKAIHUA);
    expect(result.fanIds).not.toContain(constants.FAN_QIANGGANGHU);
  });

  test.each(fanCases)(
    "fan case $input",
    ({ input, expectedNames, altExpectedNames }) => {
      const result = evaluateFanRules(input);

      const actualIds = result.fanIds.slice().sort((a, b) => a - b);
      const expectedIds = mapNamesToValues(expectedNames);
      const alternateIds = altExpectedNames
        ? mapNamesToValues(altExpectedNames)
        : null;

      const matchPrimary =
        JSON.stringify(actualIds) === JSON.stringify(expectedIds);
      const matchAlt =
        alternateIds !== null &&
        JSON.stringify(actualIds) === JSON.stringify(alternateIds);

      expect(matchPrimary || matchAlt).toBe(true);

      const expectedTotal = totalFan(actualIds);
      expect(result.totalFan).toBe(expectedTotal);
    }
  );
});
