# gb-mahjong-js [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

> `gb-mahjong-js` 是一个国标麻将 Node.js 库，提供手牌字符串解析、听牌计算、和牌判断与算番能力。

## Installation

```sh
npm install --save gb-mahjong-js
```

## Usage

```js
const { Fan, Handtiles } = require("gb-mahjong-js");

const handtiles = new Handtiles();
handtiles.StringToHandtiles("[EEE,2][SSSS,1]WWWNN55pN|EE1000");

const fan = new Fan();
fan.CountFan(handtiles);

console.log(handtiles.HandtilesToString());
console.log(fan.tot_fan_res);
console.log(fan.CalcTing(handtiles).map(tile => tile.GetId()));
```

## API

- `Handtiles`
  - `StringToHandtiles(input)`：解析国标麻将字符串，成功返回 `0`，失败返回与 C++ 版一致的错误码。
  - `HandtilesToString()`：输出标准化后的手牌字符串。
  - `DrawTile(tile)` / `SetTile(tile)` / `DiscardTile()`：操作最后一张立牌。
- `Fan`
  - `JudgeHu(handtiles)`：判断当前是否和牌。
  - `JudgeHuTile(handtiles, tile)`：判断补上某张牌后是否和牌。
  - `CalcTing(handtiles)`：计算听牌。
  - `CountFan(handtiles)`：计算番种，并把结果写入 `tot_fan_res` 与 `fan_table_res`。

## Notes

- 当前 `Fan` 层通过本地 C++ bridge 调用 `third_party/GB-Mahjong` 核心，以保持与上游规则和测试结果一致。
- `Handtiles`、`Tile`、`Pack` 与常量层已在 Node.js 侧提供兼容接口。

## License

MIT © [Choimoe](https://github.com/Choimoe)

[npm-image]: https://badge.fury.io/js/gb-mahjong-js.svg
[npm-url]: https://npmjs.org/package/gb-mahjong-js
[travis-image]: https://travis-ci.com/tziakcha-stats/gb-mahjong-js.svg?branch=master
[travis-url]: https://travis-ci.com/tziakcha-stats/gb-mahjong-js
[daviddm-image]: https://david-dm.org/tziakcha-stats/gb-mahjong-js.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/tziakcha-stats/gb-mahjong-js
[coveralls-image]: https://coveralls.io/repos/tziakcha-stats/gb-mahjong-js/badge.svg
[coveralls-url]: https://coveralls.io/r/tziakcha-stats/gb-mahjong-js
