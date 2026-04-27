"use strict";

const { normalizeHandInput } = require("../solver/judge-hu");
const specialHu = require("../solver/special-hu");
const { fanCases } = require("../test-data/generated-unit-test-cases.json");

const goldenInputFor = fanName =>
  fanCases.find(
    ({ expectedNames }) =>
      expectedNames.includes(fanName) && !expectedNames.includes("FAN_HUAPAI")
  ).input;

const toHand = input => normalizeHandInput(input);

const GOLDEN_QIDUI = goldenInputFor("FAN_QIDUI");
const GOLDEN_SHISANYAO = goldenInputFor("FAN_SHISANYAO");
const GOLDEN_QUANBUKAO = goldenInputFor("FAN_QUANBUKAO");
const GOLDEN_QIXINGBUKAO = goldenInputFor("FAN_QIXINGBUKAO");

describe("special hu solver predicates", () => {
  test("recognizes qidui from golden cases and allows a four-of-a-kind as two pairs", () => {
    expect(specialHu.isQidui(toHand(GOLDEN_QIDUI))).toBe(true);
    expect(specialHu.isQidui(toHand("1111m2233p4455sEE|EE1000"))).toBe(true);
  });

  test("rejects qidui when any tile count is not a pair boundary", () => {
    expect(specialHu.isQidui(toHand("111m22m33m44p55p66s7s|EE1000"))).toBe(
      false
    );
  });

  test("recognizes shisanyao from golden cases", () => {
    expect(specialHu.isShisanyao(toHand(GOLDEN_SHISANYAO))).toBe(true);
  });

  test("rejects shisanyao when a non-terminal tile is present", () => {
    expect(specialHu.isShisanyao(toHand("19m19p18sESWNPFCC|EE1000"))).toBe(
      false
    );
  });

  test("exports dedicated bukao-family predicates", () => {
    expect(typeof specialHu.isQuanbukao).toBe("function");
    expect(typeof specialHu.isQixingbukao).toBe("function");
  });

  test("distinguishes quanbukao from qixingbukao on golden cases", () => {
    const quanbukaoHand = toHand(GOLDEN_QUANBUKAO);
    const qixingbukaoHand = toHand(GOLDEN_QIXINGBUKAO);
    const { isQixingbukao } = specialHu;

    expect(specialHu.isQuanbukao(quanbukaoHand)).toBe(true);
    expect(Boolean(isQixingbukao && isQixingbukao(quanbukaoHand))).toBe(false);
    expect(specialHu.isQuanbukao(qixingbukaoHand)).toBe(false);
    expect(Boolean(isQixingbukao && isQixingbukao(qixingbukaoHand))).toBe(true);
  });

  test("rejects bukao-family hands with numbered tiles outside the zuhelong lattice", () => {
    const invalidBukao = toHand("147m28p69sESWNPF4s|EE1000");
    const { isQixingbukao } = specialHu;

    expect(specialHu.isQuanbukao(invalidBukao)).toBe(false);
    expect(Boolean(isQixingbukao && isQixingbukao(invalidBukao))).toBe(false);
    expect(specialHu.hasSpecialHu(invalidBukao)).toBe(false);
  });

  test("hasSpecialHu accepts each supported special-hu family from golden cases", () => {
    expect(specialHu.hasSpecialHu(toHand(GOLDEN_QIDUI))).toBe(true);
    expect(specialHu.hasSpecialHu(toHand(GOLDEN_SHISANYAO))).toBe(true);
    expect(specialHu.hasSpecialHu(toHand(GOLDEN_QUANBUKAO))).toBe(true);
    expect(specialHu.hasSpecialHu(toHand(GOLDEN_QIXINGBUKAO))).toBe(true);
  });
});
