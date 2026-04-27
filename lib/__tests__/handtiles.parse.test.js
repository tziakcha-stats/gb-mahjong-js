/* eslint-disable new-cap */
"use strict";

const { Handtiles, parseHand, formatHand } = require("../index");
const {
  parseSuccessCases,
  parseFailureCases
} = require("../test-data/unit-test-cases");

const getAcceptedStrings = ({ input, expectedString }) => {
  if (expectedString) {
    if (expectedString.includes("|")) {
      return [expectedString];
    }

    return [expectedString, `${expectedString}|EE0000|`, `${expectedString}|`];
  }

  return [
    input.replace(/ /g, ""),
    `${input.replace(/ /g, "")}|EE0000|`,
    `${input.replace(/ /g, "")}|`
  ];
};

describe("Handtiles parsing", () => {
  test("normalizes a mixed fulu/lipai hand string", () => {
    const handtiles = new Handtiles();

    expect(handtiles.StringToHandtiles("345s3555567p[789m]4p")).toBe(0);
    expect(handtiles.HandtilesToString()).toBe(
      "[789m,1]345s3555567p4p|EE0000|"
    );
  });

  test("returns -1 for malformed bracket nesting", () => {
    const handtiles = new Handtiles();

    expect(handtiles.StringToHandtiles("345s35[55567p[789m]4p")).toBe(-1);
  });

  test("high-level parser preserves legacy normalization", () => {
    const hand = parseHand("345s3555567p[789m]4p");

    expect(formatHand(hand)).toBe("[789m,1]345s3555567p4p|EE0000|");
  });

  test.each(parseSuccessCases)("parses $input", ({ input, expectedString }) => {
    const handtiles = new Handtiles();
    const result = handtiles.StringToHandtiles(input);

    expect(result).toBe(0);
    expect(getAcceptedStrings({ input, expectedString })).toContain(
      handtiles.HandtilesToString()
    );
  });

  test.each(parseFailureCases)("rejects $input", ({ input, expectedCode }) => {
    const handtiles = new Handtiles();

    expect(handtiles.StringToHandtiles(input)).toBe(expectedCode);
  });
});
