"use strict";

const extractFanIds = fan => {
  const fanIds = [];

  for (let index = 1; index < fan.fan_table_res.length; index += 1) {
    for (let count = 0; count < fan.fan_table_res[index].length; count += 1) {
      fanIds.push(index);
    }
  }

  return fanIds.sort((left, right) => left - right);
};

module.exports = {
  extractFanIds
};
