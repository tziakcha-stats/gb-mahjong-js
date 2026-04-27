"use strict";

const generatedCases = require("./generated-unit-test-cases.json");

const parseSuccessCases = [
  { input: "[CCCC][FFFF][PPPP][NNNN]EE" },
  {
    input: "[345s,2]34555567p[789m]",
    expectedString: "[345s,2][789m,1]3455556p7p"
  },
  {
    input: "345s3555567p[789m]4p",
    expectedString: "[789m,1]345s3555567p4p"
  },
  {
    input: "345s3p55p5567p[789m]4p",
    expectedString: "[789m,1]345s3555567p4p"
  },
  {
    input: "345s3pFF5567p[789m]4p",
    expectedString: "[789m,1]345s35567pFF4p"
  },
  {
    input: " 345 s3pFF5 567p[789m]4p ",
    expectedString: "[789m,1]345s35567pFF4p"
  },
  {
    input: "345s345m55567p[789m]|NE1010",
    expectedString: "[789m,1]345m345s5556p7p|NE1010|"
  },
  {
    input: "345s345m55567p[789m]|NE1010|5",
    expectedString: "[789m,1]345m345s5556p7p|NE1010|abcde"
  },
  {
    input: "345s345m55567p[789m]|NE1010|cbaghd",
    expectedString: "[789m,1]345m345s5556p7p|NE1010|cbaghd"
  },
  {
    input: "345s[777m,3]345m55567p|NE1010|cbaghd",
    expectedString: "[777m,3]345m345s5556p7p|NE1010|cbaghd"
  },
  {
    input: "345s[777m,3]345m55567p|NE1010|3",
    expectedString: "[777m,3]345m345s5556p7p|NE1010|abc"
  },
  {
    input: "345s[777m,3]345m55567p|NE1010|0",
    expectedString: "[777m,3]345m345s5556p7p|NE1010|"
  },
  {
    input: "345s[777m,3]345m55567p|NE1010|8",
    expectedString: "[777m,3]345m345s5556p7p|NE1010|abcdefgh"
  },
  {
    input: "345s3p55p5567p[7777s,1]4p",
    expectedString: "[7777s,1]345s3555567p4p|EE0000|"
  },
  {
    input: "345s3p55p5567p[7777s,2]4p",
    expectedString: "[7777s,2]345s3555567p4p|EE0000|"
  },
  {
    input: "345s3p55p5567p[7777s,3]4p",
    expectedString: "[7777s,3]345s3555567p4p|EE0000|"
  },
  {
    input: "345s3p55p5567p[7777s,5]4p",
    expectedString: "[7777s,5]345s3555567p4p|EE0000|"
  },
  {
    input: "345s3p55p5567p[7777s,6]4p",
    expectedString: "[7777s,6]345s3555567p4p|EE0000|"
  },
  {
    input: "345s3p55p5567p[7777s,7]4p",
    expectedString: "[7777s,7]345s3555567p4p|EE0000|"
  },
  {
    input: "345s3p55p5567p[7777s]4p|EE0100|cbaghdfe",
    expectedString: "[7777s]345s3555567p4p|EE0100|cbaghdfe"
  },
  {
    input: "345s3pFF5567p[3333m,6]",
    expectedString: "[3333m,6]345s35567pFF "
  },
  {
    input: "345s3pFF5567pC[3333m,6]",
    expectedString: "[3333m,6]345s35567pFFC"
  },
  {
    input: "a5sghWSW[3333m,6]78m2s5s|EE0000|dc",
    expectedString: "[3333m,6]78m25sSWWagh5s|EE0000|dc"
  }
];

const parseFailureCases = [
  { input: "345s35[55567p[789m]4p", expectedCode: -1 },
  { input: "34Fp5s35[55567p[789m]4p", expectedCode: -1 },
  { input: "345s345m55567p[789m]|N1011|cbaghd", expectedCode: -1 },
  { input: "345s345m55567p[789m]||cbaghd", expectedCode: -1 },
  { input: "345s345m55567p[789m]|cbaghd", expectedCode: -1 },
  { input: "345s345m55567p[789m]|NE1011|9", expectedCode: -1 },
  { input: "345s345m55567p[789m]|NE1011|cbagjhd", expectedCode: -1 },
  { input: "[345sF,2]34555567p[789m]", expectedCode: -1 },
  { input: "[345,2]34555567p[789m]", expectedCode: -1 },
  { input: "[3C45,2]34555567p[789m]", expectedCode: -1 },
  { input: "[345s,2]34555[]567p[789m]", expectedCode: -1 },
  { input: "345s3pFF5567p[789m,F]4p", expectedCode: -1 },
  { input: "345s3pFF5567pC[346mC]", expectedCode: -1 },
  { input: "345s3pFF5567pC[333m,6]", expectedCode: -2 },
  { input: "345s3pFF5567pC[345m,5]", expectedCode: -2 },
  { input: "345s3pFF5567pC[346m]", expectedCode: -3 },
  { input: "345s3pFF5567pC[3456m]", expectedCode: -4 },
  { input: "345s3pFFP5567pC[2222m]", expectedCode: -5 },
  { input: "345s3pFFP7pC[2222m]", expectedCode: -5 },
  { input: "24s2m3pFFP5567p[2222m]", expectedCode: -6 },
  { input: "a5sghWSW[3333m,6]78m2s5s|EE0000|dca", expectedCode: -6 },
  { input: "[234m,1][555m,1]567m55576p|EE1001|3", expectedCode: -7 },
  { input: "[234m,1][555m,1]567m55566p|EE0001|3", expectedCode: -7 },
  { input: "[234m,1][555m,1]567m55576p|EE0011|3", expectedCode: -7 },
  { input: "[234m,1][555m,1]567m55566p|EE0100|3", expectedCode: -7 }
];

module.exports = {
  parseSuccessCases,
  parseFailureCases,
  tingCases: generatedCases.tingCases,
  fanCases: generatedCases.fanCases
};
