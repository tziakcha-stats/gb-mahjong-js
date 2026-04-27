/* eslint-disable new-cap, max-nested-callbacks */
"use strict";

const { Fan, Handtiles, constants } = require("../index");
const { extractFanIds } = require("../test-support/fan-result");
const { fanCases } = require("../test-data/unit-test-cases");

const mapNamesToValues = names =>
  names.map(name => constants[name]).sort((a, b) => a - b);
const totalFan = fanIds =>
  fanIds.reduce((sum, fanId) => sum + constants.FAN_SCORE[fanId], 0);

describe("Fan counting", () => {
  test("counts fan for big four winds sample", () => {
    const handtiles = new Handtiles();
    expect(handtiles.StringToHandtiles("[EEE,2][SSSS,1]WWWNN55pN|EE1000")).toBe(
      0
    );
    const fan = new Fan();

    fan.CountFan(handtiles);

    const ids = extractFanIds(fan);
    expect(ids).toContain(constants.FAN_DASIXI);
    expect(fan.tot_fan_res).toBe(totalFan(ids));
    expect(fan.fan_packs_res.length).toBeGreaterThan(0);
    expect(fan.fan_table_res[constants.FAN_DASIXI]).toEqual([[0, 1, 3, 4]]);
    expect(fan.fan_table_res[constants.FAN_MINGGANG]).toEqual([[1]]);
    fan.fan_table_res.forEach(entries => {
      entries.forEach(packIds => {
        packIds.forEach(packId => {
          expect(packId).toBeGreaterThanOrEqual(0);
          expect(packId).toBeLessThan(fan.fan_packs_res.length);
        });
      });
    });
  });

  test.each(fanCases)(
    "fan case $input",
    ({ input, expectedNames, altExpectedNames }) => {
      const handtiles = new Handtiles();
      const fan = new Fan();

      expect(handtiles.StringToHandtiles(input)).toBe(0);
      fan.CountFan(handtiles);

      const actualIds = extractFanIds(fan);
      const expectedIds = mapNamesToValues(expectedNames);
      const alternateIds = altExpectedNames
        ? mapNamesToValues(altExpectedNames)
        : null;

      expect(
        JSON.stringify(actualIds) === JSON.stringify(expectedIds) ||
          (alternateIds !== null &&
            JSON.stringify(actualIds) === JSON.stringify(alternateIds))
      ).toBe(true);

      const expectedTotal = totalFan(actualIds);
      expect(fan.tot_fan_res).toBe(expectedTotal);
    }
  );
});
