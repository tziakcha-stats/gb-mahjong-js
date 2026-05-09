/* eslint-disable new-cap */
const { Handtiles, Shanten } = require("../lib");

// 牌索引转牌名
function getTileName(index) {
  const suits = ["万", "条", "筒"];
  const honors = ["东", "南", "西", "北", "中", "发", "白"];

  if (index < 27) {
    const suit = Math.floor(index / 9);
    const number = (index % 9) + 1;
    return `${number}${suits[suit]}`;
  }

  return honors[index - 27];
}

// 打印向听数结果
function printShantenResult(label, result) {
  console.log(`\n${label}:`);
  console.log(
    `  一般型: ${
      result.normal === -1
        ? "和牌"
        : result.normal === 0
        ? "听牌"
        : result.normal
    }`
  );
  console.log(
    `  七对子: ${
      result.qidui === Infinity
        ? "不可计算"
        : result.qidui === -1
        ? "和牌"
        : result.qidui === 0
        ? "听牌"
        : result.qidui
    }`
  );
  console.log(
    `  十三幺: ${
      result.shisanyao === Infinity
        ? "不可计算"
        : result.shisanyao === -1
        ? "和牌"
        : result.shisanyao === 0
        ? "听牌"
        : result.shisanyao
    }`
  );
  console.log(
    `  全不靠: ${
      result.quanbukao === Infinity
        ? "不可计算"
        : result.quanbukao === -1
        ? "和牌"
        : result.quanbukao === 0
        ? "听牌"
        : result.quanbukao
    }`
  );
  console.log(
    `  组合龙: ${
      result.zuhelong === Infinity
        ? "不可计算"
        : result.zuhelong === -1
        ? "和牌"
        : result.zuhelong === 0
        ? "听牌"
        : result.zuhelong
    }`
  );
}

// 打印进张信息
function printWaits(result) {
  if (result.waits.length === 0) {
    console.log("  无进张信息");
    return;
  }

  console.log("  进张信息:");
  for (const wait of result.waits) {
    const discardName = getTileName(wait.discard);
    const tileNames = wait.tiles.map(t => getTileName(t)).join(", ");
    console.log(
      `    打 ${discardName}，等 ${tileNames}，共 ${wait.count} 张，向听数 ${wait.shanten}`
    );
  }
}

// 示例1: 基本向听数计算
console.log("=== 示例1: 基本向听数计算 ===");
const hand1 = new Handtiles();
hand1.StringToHandtiles("23468m25s3888899p ");
printShantenResult("23468m25s3888899p", Shanten.calcAll(hand1));

// 示例2: 听牌手牌
console.log("\n=== 示例2: 听牌手牌 ===");
const hand2 = new Handtiles();
hand2.StringToHandtiles("123m456p789s1122m");
const result2 = Shanten.calcAll(hand2);
printShantenResult("123m456p789s1122m", result2);
printWaits(result2);

// 示例3: 和牌手牌
console.log("\n=== 示例3: 和牌手牌 ===");
const hand3 = new Handtiles();
hand3.StringToHandtiles("EEESSSWWWNNNCC");
printShantenResult("EEESSSWWWNNNCC", Shanten.calcAll(hand3));

// 示例4: 带副露的手牌
console.log("\n=== 示例4: 带副露的手牌 ===");
const hand4 = new Handtiles();
hand4.StringToHandtiles("[EEE][SSS]123m456p78s");
printShantenResult("[EEE][SSS]123m456p78s", Shanten.calcAll(hand4));

// 示例5: 只计算特定牌型
console.log("\n=== 示例5: 只计算特定牌型 ===");
const hand5 = new Handtiles();
hand5.StringToHandtiles("23468m25s3888899p ");
const result5 = Shanten.calcAll(hand5, { modes: ["normal", "qidui"] });
printShantenResult("只计算一般型和七对子", result5);

// 示例6: 七对子听牌
console.log("\n=== 示例6: 七对子听牌 ===");
const hand6 = new Handtiles();
hand6.StringToHandtiles("11223344556677m");
const result6 = Shanten.calcAll(hand6);
printShantenResult("11223344556677m", result6);
printWaits(result6);

// 示例7: 十三幺听牌
console.log("\n=== 示例7: 十三幺听牌 ===");
const hand7 = new Handtiles();
hand7.StringToHandtiles("19m19s19pESWNCFPC");
const result7 = Shanten.calcAll(hand7);
printShantenResult("19m19s19pESWNCFPC", result7);
printWaits(result7);

// 示例8: 复杂手牌分析
console.log("\n=== 示例8: 复杂手牌分析 ===");
const hand8 = new Handtiles();
hand8.StringToHandtiles("123m456p789s11222m");
const result8 = Shanten.calcAll(hand8);
printShantenResult("123m456p789s11222m", result8);
printWaits(result8);

// 示例9: 空手牌
console.log("\n=== 示例9: 空手牌 ===");
const hand9 = new Handtiles();
const result9 = Shanten.calcAll(hand9);
printShantenResult("空手牌", result9);

// 示例10: 使用remain参数
console.log("\n=== 示例10: 使用remain参数 ===");
const hand10 = new Handtiles();
hand10.StringToHandtiles("123m456p789s1122m");
const remain = Array(34).fill(4);
remain[0] = 0; // 1万已用完
remain[9] = 1; // 1条只剩1张
const result10 = Shanten.calcAll(hand10, { remain });
printShantenResult("使用remain参数", result10);
printWaits(result10);
