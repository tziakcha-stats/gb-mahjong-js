"use strict";

const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..", "..");
const bridgeSource = path.join(repoRoot, "native", "gb_mahjong_bridge.cpp");
const buildDir = path.join(repoRoot, "build");
const bridgeBinary = path.join(buildDir, "gb-mahjong-bridge");
const cppSources = [
  bridgeSource,
  path.join(repoRoot, "third_party", "GB-Mahjong", "mahjong", "tile.cpp"),
  path.join(repoRoot, "third_party", "GB-Mahjong", "mahjong", "pack.cpp"),
  path.join(repoRoot, "third_party", "GB-Mahjong", "mahjong", "handtiles.cpp"),
  path.join(repoRoot, "third_party", "GB-Mahjong", "mahjong", "fan.cpp")
];

const compiler = process.env.CXX || "c++";

const needsBuild = () => {
  if (!fs.existsSync(bridgeBinary)) {
    return true;
  }

  const outputMtime = fs.statSync(bridgeBinary).mtimeMs;
  return cppSources.some(source => fs.statSync(source).mtimeMs > outputMtime);
};

const ensureBridge = () => {
  if (!needsBuild()) {
    return bridgeBinary;
  }

  fs.mkdirSync(buildDir, { recursive: true });
  try {
    childProcess.execFileSync(
      compiler,
      [
        "-std=c++11",
        "-O3",
        "-Ithird_party/GB-Mahjong/mahjong",
        "-Ithird_party/GB-Mahjong/console",
        "-o",
        bridgeBinary,
        ...cppSources.map(source => path.relative(repoRoot, source))
      ],
      {
        cwd: repoRoot,
        stdio: "inherit"
      }
    );
  } catch (_) {
    throw new Error(
      `Failed to build GB-Mahjong bridge with ${compiler}. ` +
        "Ensure a working C++ toolchain is installed or provide a prebuilt bridge binary."
    );
  }

  return bridgeBinary;
};

const runBridge = (command, hand, ...args) => {
  const binary = ensureBridge();
  const output = childProcess
    .execFileSync(binary, [command, hand, ...args], {
      cwd: repoRoot,
      encoding: "utf8"
    })
    .trimEnd();

  const lines = output.split("\n");
  const header = lines[0].trim().split(/\s+/);
  if (header[0] === "ERR") {
    return { ok: false, code: Number(header[1]) };
  }

  return { ok: true, lines, header };
};

module.exports = {
  ensureBridge,
  runBridge
};
