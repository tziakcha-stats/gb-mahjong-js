# 向听数计算器 API 文档

## 概述

向听数计算器是 `gb-mahjong-js` 库的核心功能之一，用于计算麻将手牌距离和牌所需的最少进张数。支持五种牌型的向听数计算：

- **一般型 (normal)**：标准的4面子+1雀头和牌方式
- **七对子 (qidui)**：7个对子的和牌方式
- **十三幺 (shisanyao)**：1种幺九牌各一张+其中一种的对子
- **全不靠 (quanbukao)**：14张不相邻的牌
- **组合龙 (zuhelong)**：3组特定的顺子组合

## 快速开始

```js
const { Handtiles, Shanten } = require("gb-mahjong-js");

// 创建手牌对象
const handtiles = new Handtiles();
handtiles.StringToHandtiles("23468m25s3888899p ");

// 计算向听数
const result = Shanten.calcAll(handtiles);

console.log("一般型向听数:", result.normal);
console.log("七对子向听数:", result.qidui);
console.log("十三幺向听数:", result.shisanyao);
console.log("全不靠向听数:", result.quanbukao);
console.log("组合龙向听数:", result.zuhelong);
```

## API 详解

### `Shanten.calcAll(handtiles, opt)`

计算手牌的所有牌型向听数。

#### 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `handtiles` | `Handtiles` | 是 | 手牌对象，通过 `StringToHandtiles()` 解析字符串创建 |
| `opt` | `Object` | 否 | 配置选项 |
| `opt.modes` | `string[]` | 否 | 指定计算的牌型，可选值：`"normal"`, `"qidui"`, `"shisanyao"`, `"quanbukao"`, `"zuhelong"` |
| `opt.remain` | `number[]` | 否 | 剩余牌数数组，长度为34，对应34种牌的剩余数量 |

#### 返回值

返回一个对象，包含以下属性：

| 属性 | 类型 | 说明 |
|------|------|------|
| `normal` | `number` | 一般型向听数，-1表示和牌，0表示听牌，Infinity表示不可计算 |
| `qidui` | `number` | 七对子向听数，-1表示和牌，0表示听牌，Infinity表示不可计算 |
| `shisanyao` | `number` | 十三幺向听数，-1表示和牌，0表示听牌，Infinity表示不可计算 |
| `quanbukao` | `number` | 全不靠向听数，-1表示和牌，0表示听牌，Infinity表示不可计算 |
| `zuhelong` | `number` | 组合龙向听数，-1表示和牌，0表示听牌，Infinity表示不可计算 |
| `waits` | `WaitInfo[]` | 进张信息数组，仅在13张或14张手牌时计算 |
| `details` | `PatternDetails` | 各牌型的详细进张信息 |

#### 向听数说明

- **-1**：当前手牌已经和牌
- **0**：听牌状态，只需1张牌即可和牌
- **正整数**：距离和牌所需的最少进张数
- **Infinity**：该牌型不可计算（如手牌张数不符合要求）

### `WaitInfo` 对象

进张信息对象，描述打出某张牌后的进张情况。

| 属性 | 类型 | 说明 |
|------|------|------|
| `discard` | `number` | 打出的牌索引（0-33） |
| `tiles` | `number[]` | 可进张的牌索引数组 |
| `count` | `number` | 进张总数（考虑剩余牌数） |
| `shanten` | `number` | 打出该牌后的向听数 |

### `PatternDetails` 对象

各牌型的详细信息对象，包含5个属性：

- `normal`：一般型详细信息
- `qidui`：七对子详细信息
- `shisanyao`：十三幺详细信息
- `quanbukao`：全不靠详细信息
- `zuhelong`：组合龙详细信息

每个属性包含 `perDiscard` 数组，描述每种打牌选择的详细信息。

## 牌索引对照表

向听数计算器使用0-33的索引表示34种牌：

| 索引 | 牌 | 索引 | 牌 | 索引 | 牌 | 索引 | 牌 |
|------|------|------|------|------|------|------|------|
| 0 | 1万 | 9 | 1条 | 18 | 1筒 | 27 | 东 |
| 1 | 2万 | 10 | 2条 | 19 | 2筒 | 28 | 南 |
| 2 | 3万 | 11 | 3条 | 20 | 3筒 | 29 | 西 |
| 3 | 4万 | 12 | 4条 | 21 | 4筒 | 30 | 北 |
| 4 | 5万 | 13 | 5条 | 22 | 5筒 | 31 | 中 |
| 5 | 6万 | 14 | 6条 | 23 | 6筒 | 32 | 发 |
| 6 | 7万 | 15 | 7条 | 24 | 7筒 | 33 | 白 |
| 7 | 8万 | 16 | 8条 | 25 | 8筒 | | |
| 8 | 9万 | 17 | 9条 | 26 | 9筒 | | |

## 使用示例

### 示例1：基本向听数计算

```js
const { Handtiles, Shanten } = require("gb-mahjong-js");

const handtiles = new Handtiles();
handtiles.StringToHandtiles("23468m25s3888899p ");

const result = Shanten.calcAll(handtiles);

console.log("一般型:", result.normal);   // 2
console.log("七对子:", result.qidui);   // 3
console.log("十三幺:", result.shisanyao); // 11
```

### 示例2：只计算特定牌型

```js
const { Handtiles, Shanten } = require("gb-mahjong-js");

const handtiles = new Handtiles();
handtiles.StringToHandtiles("23468m25s3888899p ");

// 只计算一般型和七对子
const result = Shanten.calcAll(handtiles, { modes: ["normal", "qidui"] });

console.log("一般型:", result.normal);   // 2
console.log("七对子:", result.qidui);   // 3
console.log("十三幺:", result.shisanyao); // Infinity（未计算）
```

### 示例3：听牌分析

```js
const { Handtiles, Shanten } = require("gb-mahjong-js");

const handtiles = new Handtiles();
handtiles.StringToHandtiles("123m456p789s1122m");

const result = Shanten.calcAll(handtiles);

console.log("向听数:", result.normal); // 0（听牌）

// 分析进张
if (result.waits.length > 0) {
  console.log("听牌选择:");
  for (const wait of result.waits) {
    console.log(`  打 ${wait.discard}，等 ${wait.tiles.join(",")}，共 ${wait.count} 张`);
  }
}
```

### 示例4：和牌判断

```js
const { Handtiles, Shanten } = require("gb-mahjong-js");

const handtiles = new Handtiles();
handtiles.StringToHandtiles("EEESSSWWWNNNCC");

const result = Shanten.calcAll(handtiles);

console.log("向听数:", result.normal); // -1（和牌）
```

### 示例5：带副露的手牌

```js
const { Handtiles, Shanten } = require("gb-mahjong-js");

const handtiles = new Handtiles();
handtiles.StringToHandtiles("[EEE][SSS]123m456p78s");

const result = Shanten.calcAll(handtiles);

console.log("一般型:", result.normal);   // 0（听牌）
console.log("七对子:", result.qidui);   // Infinity（有副露不能七对子）
console.log("十三幺:", result.shisanyao); // Infinity（有副露不能十三幺）
```

### 示例6：指定剩余牌数

```js
const { Handtiles, Shanten } = require("gb-mahjong-js");

const handtiles = new Handtiles();
handtiles.StringToHandtiles("23468m25s3888899p ");

// 创建剩余牌数数组（34种牌）
const remain = Array(34).fill(4); // 默认每种牌4张
remain[0] = 0; // 1万已用完

const result = Shanten.calcAll(handtiles, { remain });

console.log("进张信息:", result.waits);
```

### 示例7：获取牌名

```js
const { Handtiles, Shanten } = require("gb-mahjong-js");

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

const handtiles = new Handtiles();
handtiles.StringToHandtiles("123m456p789s1122m");

const result = Shanten.calcAll(handtiles);

if (result.waits.length > 0) {
  console.log("听牌:");
  for (const tile of result.waits[0].tiles) {
    console.log(`  ${getTileName(tile)}`);
  }
}
```

## 注意事项

1. **手牌张数**：向听数计算要求手牌为13张（不含副露）或14张。13张手牌会自动补充一张无效牌。

2. **副露限制**：有副露（吃、碰、杠）的手牌不能计算七对子、十三幺和全不靠。

3. **全不靠特殊性**：全不靠只在14张手牌时计算。

4. **组合龙特殊性**：组合龙只在手牌张数≥9时计算。

5. **性能优化**：向听数计算器使用了动态规划和记忆化搜索，对于复杂手牌计算效率较高。

6. **牌型优先级**：`calcAll` 返回的是各牌型独立的向听数，实际打牌时应选择向听数最小的牌型。

## 错误处理

如果输入的手牌字符串格式不正确，`StringToHandtiles()` 会返回错误码：

| 错误码 | 说明 |
|--------|------|
| -1 | 格式不匹配 |
| -2 | 杠牌数量错误 |
| -3 | 顺子/刻子格式错误 |
| -4 | 杠牌格式错误 |
| -5 | 手牌张数错误 |
| -6 | 牌数量超限 |
| -7 | 状态标记冲突 |

## 相关链接

- [README](../README.md)
- [示例文件](../examples/shanten-example.js)
- [测试文件](../lib/__tests__/solver.shanten.test.js)
