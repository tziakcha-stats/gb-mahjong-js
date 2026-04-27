/* eslint-disable new-cap */
const api = require("../index");
const { Pack, Tile, constants } = api;

test("exports compatibility core", () => {
  expect(typeof Tile).toBe("function");
  expect(typeof Pack).toBe("function");
  expect(constants.TILE_1m).toBe(1);
});

test("exports named constants alongside grouped constants", () => {
  expect(constants.SUIT_TIAO).toBe(2);
  expect(constants.PACK_TYPE_SHUNZI).toBe(1);
});

test("exports pure js high-level api", () => {
  expect(typeof api.parseHand).toBe("function");
  expect(typeof api.formatHand).toBe("function");
  expect(typeof api.judgeHu).toBe("function");
  expect(typeof api.judgeHuTile).toBe("function");
  expect(typeof api.calcTing).toBe("function");
  expect(typeof api.countFan).toBe("function");
});

test("exports low-level model constructors", () => {
  expect(typeof api.Hand).toBe("function");
  expect(typeof api.WinContext).toBe("function");
  expect(typeof api.FanCalculator).toBe("function");
  expect(typeof api.FanResult).toBe("function");
  expect(typeof api.DecompositionPack).toBe("function");

  const hand = new api.Hand();
  expect(hand.tiles).toEqual([]);
  expect(hand.packs).toEqual([]);
  expect(hand.winningTile).toBe(null);
  expect(hand.flowers).toEqual([]);
  expect(hand.context).toBeInstanceOf(api.WinContext);
  expect(hand.source).toBe(null);
  expect(hand).not.toHaveProperty("handtiles");

  const context = new api.WinContext();
  expect(context.quanfeng).toBe(constants.TILE_E);
  expect(context.menfeng).toBe(constants.TILE_E);
  expect(context.zimo).toBe(false);
  expect(context.juezhang).toBe(false);
  expect(context.haidi).toBe(false);
  expect(context.gang).toBe(false);

  const fanResult = new api.FanResult();
  expect(fanResult.isHu).toBe(false);
  expect(fanResult.totalFan).toBe(0);
  expect(fanResult.fanIds).toEqual([]);
  expect(fanResult.total).toBe(0);
  expect(fanResult.fans).toEqual([]);
  expect(fanResult.packs).toEqual([]);
  expect(fanResult.decomposition).toBe(null);

  const decompositionPack = new api.DecompositionPack();
  expect(decompositionPack.type).toBe(null);
  expect(decompositionPack.tile).toBe(null);
  expect(decompositionPack.offer).toBe(0);
  expect(decompositionPack.zuhelong).toBe(0);
});

test("high-level api accepts Hand input and explicit options override context", () => {
  const hand = new api.Hand({
    tiles: [new api.Tile(constants.TILE_1m)],
    winningTile: new api.Tile(constants.TILE_9m),
    context: new api.WinContext({ zimo: false })
  });
  const judged = api.judgeHu(hand, { zimo: true });
  const judgedTile = api.judgeHuTile(hand, constants.TILE_9m, { zimo: true });
  const ting = api.calcTing(hand, { includeExhaustedTile: true });

  expect(typeof judged).toBe("boolean");
  expect(typeof judgedTile).toBe("boolean");
  expect(Array.isArray(ting)).toBe(true);
  expect(hand.tiles).toHaveLength(1);
  expect(hand.tiles[0].GetId()).toBe(constants.TILE_1m);
  expect(hand.winningTile.GetId()).toBe(constants.TILE_9m);
  expect(hand.context.zimo).toBe(false);
  expect(hand).not.toHaveProperty("handtiles");
});

test("parse and format operations use the parser api", () => {
  const hand = api.parseHand("345s3555567p[789m]4p");

  expect(hand).toBeInstanceOf(api.Hand);
  expect(api.formatHand(hand)).toBe("[789m,1]345s3555567p4p|EE0000|");
});

test("countFan returns an empty FanResult for non-hu input", () => {
  expect(api.countFan(new api.Hand())).toMatchObject({
    isHu: false,
    totalFan: 0,
    fanIds: [],
    fans: [],
    decomposition: null
  });
});

test("countFan works without importing the native bridge module", () => {
  jest.resetModules();
  jest.doMock("../core/native-bridge", () => {
    throw new Error("runtime should not import bridge");
  });

  let runtimeApi;

  expect(() => {
    runtimeApi = require("../index");
  }).not.toThrow();
  expect(() =>
    runtimeApi.countFan("[EEE,2][SSSS,1]WWWNN55pN|EE1000")
  ).not.toThrow();

  jest.dontMock("../core/native-bridge");
});

test("package metadata no longer forces bridge compilation during prepack", () => {
  const pkg = require("../../package.json");

  expect(pkg.scripts.prepack).not.toBe("npm run build:bridge");
});
