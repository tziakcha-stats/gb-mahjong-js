"use strict";

const { constants, parseHand } = require("../index");
const { evaluateFanRules } = require("../solver/fan-rules");

describe("fan rules", () => {
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
});
