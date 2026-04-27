# GB-Mahjong-JS Core Port Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the `third_party/GB-Mahjong` C++ core into a CommonJS Node.js library with complete Jest coverage for the C++ unit test behaviors.

**Architecture:** Keep a compatibility-first core under `lib/core/` that mirrors the C++ model (`Tile`, `Pack`, `Handtiles`, `Fan`) and preserves the original numeric encodings, parsing rules, error codes, and fan calculation semantics. Build the port in layers so parsing stabilizes before hu/ting logic, and hu/ting stabilizes before full fan counting. Use parameterized Jest cases derived from `third_party/GB-Mahjong/unit_test.cpp` as the primary correctness oracle.

**Tech Stack:** Node.js, CommonJS modules, Jest 26, ESLint 6, Prettier, ripgrep for source inspection.

---

## File Map

- Create: `lib/core/constants.js`
  - Tile ids, suit/rank constants, char constants, bitmap constants, fan ids, fan scores, fan names, Zuhelong bitmaps.
- Create: `lib/core/tile.js`
  - `Tile` class and tile-level helpers.
- Create: `lib/core/pack.js`
  - `Pack` class and pack-type helpers.
- Create: `lib/core/handtiles.js`
  - `Handtiles` class, parse/serialize logic, tile-count tables, status flags.
- Create: `lib/core/fan.js`
  - `Fan` class, hu checks, ting checks, count-fan logic.
- Modify: `lib/index.js`
  - Export core classes and constants.
- Replace: `lib/__tests__/gbMahjongJs.test.js`
  - Remove scaffold failure test, keep a smoke-level public API test.
- Create: `lib/__tests__/tile.test.js`
  - Tile/pack-level unit tests.
- Create: `lib/__tests__/handtiles.parse.test.js`
  - Parsing, normalization, invalid-input codes.
- Create: `lib/__tests__/fan.hu-ting.test.js`
  - `JudgeHu`, `JudgeHuTile`, `CalcTing` tests.
- Create: `lib/__tests__/fan.count.test.js`
  - `CountFan`, total fan, fan-table result tests.
- Create: `lib/__tests__/fixtures/unit-test-cases.js`
  - Structured test case data extracted from the C++ suite.
- Modify: `README.md`
  - Replace placeholder usage with actual API.
- Optional helper: `lib/__tests__/helpers/fan-result.js`
  - Shared fan-result extraction helper if test duplication becomes high.

## Implementation Rules

- Preserve CommonJS and `lib/*.js` layout in this phase.
- Do not introduce TypeScript, transpilation, or runtime dependencies.
- Do not commit during execution unless the user explicitly asks.
- Follow TDD strictly per task: write failing test, verify fail, implement minimal code, verify pass.
- Prefer direct translation of C++ control flow for `fan.cpp` and `handtiles.cpp`; only extract helpers when they reduce JS-specific accidental complexity.

### Task 1: Scaffold constants, `Tile`, `Pack`, and public exports

**Files:**
- Create: `lib/core/constants.js`
- Create: `lib/core/tile.js`
- Create: `lib/core/pack.js`
- Modify: `lib/index.js`
- Replace: `lib/__tests__/gbMahjongJs.test.js`
- Create: `lib/__tests__/tile.test.js`

- [ ] **Step 1: Write failing public-api and tile/pack tests**

```js
const { Tile, Pack, constants } = require("../index");

test("exports compatibility core", () => {
  expect(typeof Tile).toBe("function");
  expect(typeof Pack).toBe("function");
  expect(constants.TILE_1m).toBe(1);
});

test("tile exposes suit, rank, and draw flags", () => {
  const tile = new Tile(constants.TILE_5s);
  expect(tile.Suit()).toBe(constants.SUIT_TIAO);
  expect(tile.Rank()).toBe(constants.RANK_5);
  tile.SetZimo();
  expect(tile.IsZimo()).toBe(true);
});
```

- [ ] **Step 2: Run focused tests to verify they fail**

Run: `npx jest lib/__tests__/gbMahjongJs.test.js lib/__tests__/tile.test.js --runInBand`
Expected: FAIL because core exports and classes do not exist yet.

- [ ] **Step 3: Implement constants and minimal `Tile` / `Pack` behavior**

- Port numeric constants and bitmap tables from `third_party/GB-Mahjong/mahjong/tile.h`, `tile.cpp`, and `pack.h`.
- Port all fan-related enums and lookup tables (`fan_t`, `FAN_SCORE`, `FAN_NAME`) into `lib/core/constants.js` as the single source of truth.
- Implement `Tile` methods required by the new tests first.
- Implement `Pack` constructor, type helpers, `GetAllTile`, `IsAnshou`, and `HaveLastTile`.
- Export everything through `lib/index.js` and keep `constants` as a grouped export in addition to named constants.

- [ ] **Step 4: Run focused tests until green**

Run: `npx jest lib/__tests__/gbMahjongJs.test.js lib/__tests__/tile.test.js --runInBand`
Expected: PASS.

- [ ] **Step 5: Run lint on touched files**

Run: `npx eslint lib/index.js lib/core/constants.js lib/core/tile.js lib/core/pack.js lib/__tests__/gbMahjongJs.test.js lib/__tests__/tile.test.js`
Expected: no lint errors.

### Task 2: Port `Handtiles` parsing, normalization, and state model

**Files:**
- Create: `lib/core/handtiles.js`
- Modify: `lib/index.js`
- Create: `lib/__tests__/fixtures/unit-test-cases.js`
- Create: `lib/__tests__/handtiles.parse.test.js`

- [ ] **Step 1: Write failing parse/serialize tests from the first C++ string cases**

```js
const { Handtiles } = require("../index");

it("normalizes a mixed fulu/lipai hand string", () => {
  const handtiles = new Handtiles();
  expect(handtiles.StringToHandtiles("345s3555567p[789m]4p")).toBe(0);
  expect(handtiles.HandtilesToString()).toBe("[789m,1]345s3555567p4p");
});

it("returns -1 for malformed bracket nesting", () => {
  const handtiles = new Handtiles();
  expect(handtiles.StringToHandtiles("345s35[55567p[789m]4p")).toBe(-1);
});
```

- [ ] **Step 2: Run focused parse tests to verify they fail**

Run: `npx jest lib/__tests__/handtiles.parse.test.js --runInBand`
Expected: FAIL because `Handtiles` is missing.

- [ ] **Step 3: Implement `Handtiles` data model and parse/serialize path**

- Mirror `fulu`, `lipai`, `huapai`, the three count tables, and the six state flags from `handtiles.h`.
- Port `_ClearAndSetDefault`, `_GenerateTable`, draw/set/discard helpers, sort helpers, and public state queries.
- Port enough of `StringToHandtiles` and `HandtilesToString` to satisfy the first parse slice before adding more cases.
- Extract reusable fixtures from `unit_test.cpp` into `lib/__tests__/fixtures/unit-test-cases.js` as arrays of `{ input, expectedCode, expectedString }`.

- [ ] **Step 4: Expand tests with the full parse success/failure block from `unit_test.cpp`**

- Add parameterized tests for all parse-related `test(ret, string, correctString)` samples from the C++ suite.
- Assert both return code and normalized output when return code is `0`.

- [ ] **Step 5: Run parse tests and lint**

Run: `npx jest lib/__tests__/handtiles.parse.test.js --runInBand`
Expected: PASS.

Run: `npx eslint lib/core/handtiles.js lib/index.js lib/__tests__/fixtures/unit-test-cases.js lib/__tests__/handtiles.parse.test.js`
Expected: no lint errors.

### Task 3: Port hu judgment and ting calculation

**Files:**
- Create or modify: `lib/core/fan.js`
- Modify: `lib/index.js`
- Modify: `lib/__tests__/fixtures/unit-test-cases.js`
- Create: `lib/__tests__/fan.hu-ting.test.js`

- [ ] **Step 1: Write failing hu/ting tests from the first C++ ting cases**

```js
const { Fan, Handtiles, constants } = require("../index");

it("calculates ting tiles for thirteen orphans shape", () => {
  const handtiles = new Handtiles();
  handtiles.StringToHandtiles("19m19s19pESWNCFP ");
  const fan = new Fan();
  expect(fan.CalcTing(handtiles)).toEqual([
    constants.TILE_1m,
    constants.TILE_1p,
    constants.TILE_1s,
  ]);
});
```

- [ ] **Step 2: Run focused hu/ting tests to verify they fail**

Run: `npx jest lib/__tests__/fan.hu-ting.test.js --runInBand`
Expected: FAIL because `Fan` hu/ting logic is not implemented.

- [ ] **Step 3: Port `JudgeHu`, `JudgeHuTile`, and `CalcTing`**

- Port hu-related helpers from `third_party/GB-Mahjong/mahjong/fan.cpp` in the same semantic order as C++.
- Keep the “exclude exhausted tiles by default” behavior in `CalcTing`.
- Preserve handling for special hu forms, basic hu, and zuhelong-based hu.
- Add small internal helpers only when they remove JS container noise.

- [ ] **Step 4: Expand tests to the full C++ ting block and selected hu spot checks**

- Move all `test(string, vector<Tile>{...})` cases into `fan.hu-ting.test.js`.
- Add direct `JudgeHu` / `JudgeHuTile` spot checks for representative complete hands and invalid-completion hands to catch regressions earlier than fan-count tests.

- [ ] **Step 5: Run hu/ting tests and lint**

Run: `npx jest lib/__tests__/fan.hu-ting.test.js --runInBand`
Expected: PASS.

Run: `npx eslint lib/core/fan.js lib/index.js lib/__tests__/fixtures/unit-test-cases.js lib/__tests__/fan.hu-ting.test.js`
Expected: no lint errors.

### Task 4: Port fan counting core and result tables

**Files:**
- Modify: `lib/core/fan.js`
- Modify: `lib/__tests__/fixtures/unit-test-cases.js`
- Create: `lib/__tests__/fan.count.test.js`
- Optional create: `lib/__tests__/helpers/fan-result.js`

- [ ] **Step 1: Write failing fan-count tests from the first C++ fan cases**

```js
const { Fan, Handtiles, constants } = require("../index");

it("counts fan for big four winds sample", () => {
  const handtiles = new Handtiles();
  handtiles.StringToHandtiles("[EEE,2][SSSS,1]WWWNN55pN|EE1000");
  const fan = new Fan();
  fan.CountFan(handtiles);
  expect(fan.tot_fan_res).toBeGreaterThan(0);
  expect(extractFanIds(fan)).toContain(constants.FAN_DASIXI);
});
```

- [ ] **Step 2: Run focused fan-count tests to verify they fail**

Run: `npx jest lib/__tests__/fan.count.test.js --runInBand`
Expected: FAIL because `CountFan` and result tables are incomplete.

- [ ] **Step 3: Port count-fan flow and exclusion logic**

- Consume `fan_t`, `FAN_SCORE`, and `FAN_NAME` from `lib/core/constants.js`, and implement the result tables, exclusion tables, and `_GetMaxFan` / `_FanTableExclude` / `_FanTableCount` / `_Clear*` helpers in `fan.js`.
- Translate the DFS/search-based pack decomposition without altering scoring priority.
- Preserve duplicated fan entries when the C++ version counts the same fan type multiple times.

- [ ] **Step 4: Expand tests to the full fan block from `unit_test.cpp`**

- Convert all `test(string, vector<fan_t> ...)` cases into parameterized Jest cases.
- Assert total fan count and exact sorted fan-id list; allow alternate valid fan-id lists where the C++ suite provides two accepted vectors.
- Add helper extraction only if repeated result-table traversal becomes noisy.

- [ ] **Step 5: Run fan-count tests and lint**

Run: `npx jest lib/__tests__/fan.count.test.js --runInBand`
Expected: PASS.

Run: `npx eslint lib/core/fan.js lib/__tests__/fixtures/unit-test-cases.js lib/__tests__/fan.count.test.js lib/__tests__/helpers/fan-result.js`
Expected: no lint errors (skip helper path if not created).

### Task 5: Integration, README, and full-suite verification

**Files:**
- Modify: `README.md`
- Review all files from Tasks 1-4

- [ ] **Step 1: Write or update the smoke-level public API test if gaps remain**

- Ensure `lib/__tests__/gbMahjongJs.test.js` exercises a realistic end-to-end flow:
  parse hand → calc ting or count fan → assert public exports usable.

- [ ] **Step 2: Update `README.md` to document the actual API**

- Replace placeholder `gbMahjongJs('Rainbow')` sample with a minimal real example using `Handtiles` and `Fan`.
- Keep the README concise; no need to document every fan enum in this phase.

- [ ] **Step 3: Run targeted lint and tests on the full changed surface**

Run: `npx eslint lib`
Expected: all JS files under `lib/` pass lint.

Run: `npx jest --runInBand`
Expected: all Jest tests pass.

- [ ] **Step 4: Run repository test command and capture baseline caveat**

Run: `npm test`
Expected: PASS after replacing scaffold files and implementing the core. If external legacy warnings remain, note them, but do not leave failing lint/test checks.

- [ ] **Step 5: Summarize remaining risks**

- Compare the JS test corpus against `third_party/GB-Mahjong/unit_test.cpp` one more time to confirm nothing was skipped.
- Produce or update a simple coverage checklist in the fixture file comments or final notes that accounts for every parse, ting, and fan case family from `third_party/GB-Mahjong/unit_test.cpp`.
- Note any deliberate deviations in documentation or final handoff.

## Execution Notes for Controller

- Start with Task 1 and Task 2 sequentially because later tasks depend on these files.
- After `constants.js`, `tile.js`, `pack.js`, and `handtiles.js` are stable, Task 3 and the test-fixture expansion can proceed.
- Task 4 should begin only after `JudgeHu` and `CalcTing` semantics are stable in `fan.js`.
- Parallel subagents are allowed only for disjoint write scopes; do not run two implementers against `lib/core/fan.js` simultaneously.
- Because the repository baseline currently fails lint on scaffold files, Task 1 implicitly owns replacing the scaffold test and fixing `lib/index.js` formatting so the suite can become green.
