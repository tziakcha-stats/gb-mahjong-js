/* eslint-disable new-cap */
const { Handtiles, Shanten } = require("../lib");

const handtiles = new Handtiles();
handtiles.StringToHandtiles("23468m25s3888899p ");

console.log("手牌:", handtiles.HandtilesToString());

const result = Shanten.calcAll(handtiles);

console.log("向听数:");
console.log("  一般型:", result.normal);
console.log("  七对子:", result.qidui);
console.log("  十三幺:", result.shisanyao);
console.log("  全不靠:", result.quanbukao);
console.log("  组合龙:", result.zuhelong);

console.log("进张信息:");
if (result.waits.length > 0) {
  console.log("  最优进张:", result.waits[0]);
}
