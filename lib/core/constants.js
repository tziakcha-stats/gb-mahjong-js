/* eslint-disable camelcase, new-cap */
/* global BigInt */
"use strict";

const TILE_INVALID = 0;
const TILE_1m = 1;
const TILE_2m = 2;
const TILE_3m = 3;
const TILE_4m = 4;
const TILE_5m = 5;
const TILE_6m = 6;
const TILE_7m = 7;
const TILE_8m = 8;
const TILE_9m = 9;
const TILE_1s = 10;
const TILE_2s = 11;
const TILE_3s = 12;
const TILE_4s = 13;
const TILE_5s = 14;
const TILE_6s = 15;
const TILE_7s = 16;
const TILE_8s = 17;
const TILE_9s = 18;
const TILE_1p = 19;
const TILE_2p = 20;
const TILE_3p = 21;
const TILE_4p = 22;
const TILE_5p = 23;
const TILE_6p = 24;
const TILE_7p = 25;
const TILE_8p = 26;
const TILE_9p = 27;
const TILE_E = 28;
const TILE_S = 29;
const TILE_W = 30;
const TILE_N = 31;
const TILE_C = 32;
const TILE_F = 33;
const TILE_P = 34;
const TILE_MEI = 35;
const TILE_LAN = 36;
const TILE_ZHU = 37;
const TILE_JU = 38;
const TILE_CHU = 39;
const TILE_XIA = 40;
const TILE_QIU = 41;
const TILE_DONG = 42;
const TILE_BAIDA = 43;
const TILE_MAJIANG = 44;
const TILE_SIZE = 43;

const SUIT_INVALID = 0;
const SUIT_WAN = 1;
const SUIT_TIAO = 2;
const SUIT_BING = 3;
const SUIT_HUA = 4;
const SUIT_FENG = 5;
const SUIT_JIAN = 6;

const RANK_INVALID = 0;
const RANK_1 = 1;
const RANK_2 = 2;
const RANK_3 = 3;
const RANK_4 = 4;
const RANK_5 = 5;
const RANK_6 = 6;
const RANK_7 = 7;
const RANK_8 = 8;
const RANK_9 = 9;

const TILE_CHAR_INVALID = " ";
const TILE_CHAR_WAN = "m";
const TILE_CHAR_TIAO = "s";
const TILE_CHAR_BING = "p";
const TILE_CHAR_E = "E";
const TILE_CHAR_S = "S";
const TILE_CHAR_W = "W";
const TILE_CHAR_N = "N";
const TILE_CHAR_C = "C";
const TILE_CHAR_F = "F";
const TILE_CHAR_P = "P";
const TILE_CHAR_MEI = "a";
const TILE_CHAR_LAN = "b";
const TILE_CHAR_ZHU = "c";
const TILE_CHAR_JU = "d";
const TILE_CHAR_CHU = "e";
const TILE_CHAR_XIA = "f";
const TILE_CHAR_QIU = "g";
const TILE_CHAR_DONG = "h";

const PACK_TYPE_INVALID = 0;
const PACK_TYPE_SHUNZI = 1;
const PACK_TYPE_KEZI = 2;
const PACK_TYPE_GANG = 3;
const PACK_TYPE_JIANG = 4;
const PACK_TYPE_ZUHELONG = 5;

const BITMAP = tile => 1n << BigInt(tile);

const TILES_UTF8 = [
  "",
  "🀇",
  "🀈",
  "🀉",
  "🀊",
  "🀋",
  "🀌",
  "🀍",
  "🀎",
  "🀏",
  "🀐",
  "🀑",
  "🀒",
  "🀓",
  "🀔",
  "🀕",
  "🀖",
  "🀗",
  "🀘",
  "🀙",
  "🀚",
  "🀛",
  "🀜",
  "🀝",
  "🀞",
  "🀟",
  "🀠",
  "🀡",
  "🀀",
  "🀁",
  "🀂",
  "🀃",
  "🀄",
  "🀅",
  "🀆",
  "🀢",
  "🀣",
  "🀤",
  "🀥",
  "🀦",
  "🀧",
  "🀨",
  "🀩",
  "🀪",
  "🀫"
];

const TILES_SUIT = [
  SUIT_INVALID,
  SUIT_WAN,
  SUIT_WAN,
  SUIT_WAN,
  SUIT_WAN,
  SUIT_WAN,
  SUIT_WAN,
  SUIT_WAN,
  SUIT_WAN,
  SUIT_WAN,
  SUIT_TIAO,
  SUIT_TIAO,
  SUIT_TIAO,
  SUIT_TIAO,
  SUIT_TIAO,
  SUIT_TIAO,
  SUIT_TIAO,
  SUIT_TIAO,
  SUIT_TIAO,
  SUIT_BING,
  SUIT_BING,
  SUIT_BING,
  SUIT_BING,
  SUIT_BING,
  SUIT_BING,
  SUIT_BING,
  SUIT_BING,
  SUIT_BING,
  SUIT_FENG,
  SUIT_FENG,
  SUIT_FENG,
  SUIT_FENG,
  SUIT_JIAN,
  SUIT_JIAN,
  SUIT_JIAN,
  SUIT_HUA,
  SUIT_HUA,
  SUIT_HUA,
  SUIT_HUA,
  SUIT_HUA,
  SUIT_HUA,
  SUIT_HUA,
  SUIT_HUA,
  SUIT_INVALID,
  SUIT_INVALID
];

const TILES_RANK = [
  RANK_INVALID,
  RANK_1,
  RANK_2,
  RANK_3,
  RANK_4,
  RANK_5,
  RANK_6,
  RANK_7,
  RANK_8,
  RANK_9,
  RANK_1,
  RANK_2,
  RANK_3,
  RANK_4,
  RANK_5,
  RANK_6,
  RANK_7,
  RANK_8,
  RANK_9,
  RANK_1,
  RANK_2,
  RANK_3,
  RANK_4,
  RANK_5,
  RANK_6,
  RANK_7,
  RANK_8,
  RANK_9,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID,
  RANK_INVALID
];

const TILES_SUIT_CHAR = [
  TILE_CHAR_INVALID,
  TILE_CHAR_WAN,
  TILE_CHAR_WAN,
  TILE_CHAR_WAN,
  TILE_CHAR_WAN,
  TILE_CHAR_WAN,
  TILE_CHAR_WAN,
  TILE_CHAR_WAN,
  TILE_CHAR_WAN,
  TILE_CHAR_WAN,
  TILE_CHAR_TIAO,
  TILE_CHAR_TIAO,
  TILE_CHAR_TIAO,
  TILE_CHAR_TIAO,
  TILE_CHAR_TIAO,
  TILE_CHAR_TIAO,
  TILE_CHAR_TIAO,
  TILE_CHAR_TIAO,
  TILE_CHAR_TIAO,
  TILE_CHAR_BING,
  TILE_CHAR_BING,
  TILE_CHAR_BING,
  TILE_CHAR_BING,
  TILE_CHAR_BING,
  TILE_CHAR_BING,
  TILE_CHAR_BING,
  TILE_CHAR_BING,
  TILE_CHAR_BING,
  TILE_CHAR_E,
  TILE_CHAR_S,
  TILE_CHAR_W,
  TILE_CHAR_N,
  TILE_CHAR_C,
  TILE_CHAR_F,
  TILE_CHAR_P,
  TILE_CHAR_MEI,
  TILE_CHAR_LAN,
  TILE_CHAR_ZHU,
  TILE_CHAR_JU,
  TILE_CHAR_CHU,
  TILE_CHAR_XIA,
  TILE_CHAR_QIU,
  TILE_CHAR_DONG,
  TILE_CHAR_INVALID,
  TILE_CHAR_INVALID
];

const TILE_TYPE_BITMAP_WAN =
  BITMAP(TILE_1m) |
  BITMAP(TILE_2m) |
  BITMAP(TILE_3m) |
  BITMAP(TILE_4m) |
  BITMAP(TILE_5m) |
  BITMAP(TILE_6m) |
  BITMAP(TILE_7m) |
  BITMAP(TILE_8m) |
  BITMAP(TILE_9m);
const TILE_TYPE_BITMAP_TIAO =
  BITMAP(TILE_1s) |
  BITMAP(TILE_2s) |
  BITMAP(TILE_3s) |
  BITMAP(TILE_4s) |
  BITMAP(TILE_5s) |
  BITMAP(TILE_6s) |
  BITMAP(TILE_7s) |
  BITMAP(TILE_8s) |
  BITMAP(TILE_9s);
const TILE_TYPE_BITMAP_BING =
  BITMAP(TILE_1p) |
  BITMAP(TILE_2p) |
  BITMAP(TILE_3p) |
  BITMAP(TILE_4p) |
  BITMAP(TILE_5p) |
  BITMAP(TILE_6p) |
  BITMAP(TILE_7p) |
  BITMAP(TILE_8p) |
  BITMAP(TILE_9p);
const TILE_TYPE_BITMAP_SHU =
  TILE_TYPE_BITMAP_WAN | TILE_TYPE_BITMAP_TIAO | TILE_TYPE_BITMAP_BING;
const TILE_TYPE_BITMAP_FENG =
  BITMAP(TILE_E) | BITMAP(TILE_S) | BITMAP(TILE_W) | BITMAP(TILE_N);
const TILE_TYPE_BITMAP_JIAN = BITMAP(TILE_C) | BITMAP(TILE_F) | BITMAP(TILE_P);
const TILE_TYPE_BITMAP_ZI = TILE_TYPE_BITMAP_FENG | TILE_TYPE_BITMAP_JIAN;
const TILE_TYPE_BITMAP_MEANINGFUL = TILE_TYPE_BITMAP_SHU | TILE_TYPE_BITMAP_ZI;
const TILE_TYPE_BITMAP_YAOJIU =
  TILE_TYPE_BITMAP_ZI |
  BITMAP(TILE_1m) |
  BITMAP(TILE_9m) |
  BITMAP(TILE_1s) |
  BITMAP(TILE_9s) |
  BITMAP(TILE_1p) |
  BITMAP(TILE_9p);
const TILE_TYPE_BITMAP_LV =
  BITMAP(TILE_2s) |
  BITMAP(TILE_3s) |
  BITMAP(TILE_4s) |
  BITMAP(TILE_6s) |
  BITMAP(TILE_8s) |
  BITMAP(TILE_F);
const TILE_TYPE_BITMAP_QUANDA =
  BITMAP(TILE_7m) |
  BITMAP(TILE_8m) |
  BITMAP(TILE_9m) |
  BITMAP(TILE_7s) |
  BITMAP(TILE_8s) |
  BITMAP(TILE_9s) |
  BITMAP(TILE_7p) |
  BITMAP(TILE_8p) |
  BITMAP(TILE_9p);
const TILE_TYPE_BITMAP_QUANZHONG =
  BITMAP(TILE_4m) |
  BITMAP(TILE_5m) |
  BITMAP(TILE_6m) |
  BITMAP(TILE_4s) |
  BITMAP(TILE_5s) |
  BITMAP(TILE_6s) |
  BITMAP(TILE_4p) |
  BITMAP(TILE_5p) |
  BITMAP(TILE_6p);
const TILE_TYPE_BITMAP_QUANXIAO =
  BITMAP(TILE_1m) |
  BITMAP(TILE_2m) |
  BITMAP(TILE_3m) |
  BITMAP(TILE_1s) |
  BITMAP(TILE_2s) |
  BITMAP(TILE_3s) |
  BITMAP(TILE_1p) |
  BITMAP(TILE_2p) |
  BITMAP(TILE_3p);
const TILE_TYPE_BITMAP_DAYUWU =
  TILE_TYPE_BITMAP_QUANDA | BITMAP(TILE_6m) | BITMAP(TILE_6s) | BITMAP(TILE_6p);
const TILE_TYPE_BITMAP_XIAOYUWU =
  TILE_TYPE_BITMAP_QUANXIAO |
  BITMAP(TILE_4m) |
  BITMAP(TILE_4s) |
  BITMAP(TILE_4p);
const TILE_TYPE_BITMAP_TUIBUDAO =
  BITMAP(TILE_2s) |
  BITMAP(TILE_4s) |
  BITMAP(TILE_5s) |
  BITMAP(TILE_6s) |
  BITMAP(TILE_8s) |
  BITMAP(TILE_9s) |
  BITMAP(TILE_1p) |
  BITMAP(TILE_2p) |
  BITMAP(TILE_3p) |
  BITMAP(TILE_4p) |
  BITMAP(TILE_5p) |
  BITMAP(TILE_8p) |
  BITMAP(TILE_9p) |
  BITMAP(TILE_P);

const ZuhelongBitmap = [
  0n,
  BITMAP(TILE_1m) |
    BITMAP(TILE_4m) |
    BITMAP(TILE_7m) |
    BITMAP(TILE_2s) |
    BITMAP(TILE_5s) |
    BITMAP(TILE_8s) |
    BITMAP(TILE_3p) |
    BITMAP(TILE_6p) |
    BITMAP(TILE_9p),
  BITMAP(TILE_1m) |
    BITMAP(TILE_4m) |
    BITMAP(TILE_7m) |
    BITMAP(TILE_3s) |
    BITMAP(TILE_6s) |
    BITMAP(TILE_9s) |
    BITMAP(TILE_2p) |
    BITMAP(TILE_5p) |
    BITMAP(TILE_8p),
  BITMAP(TILE_2m) |
    BITMAP(TILE_5m) |
    BITMAP(TILE_8m) |
    BITMAP(TILE_1s) |
    BITMAP(TILE_4s) |
    BITMAP(TILE_7s) |
    BITMAP(TILE_3p) |
    BITMAP(TILE_6p) |
    BITMAP(TILE_9p),
  BITMAP(TILE_2m) |
    BITMAP(TILE_5m) |
    BITMAP(TILE_8m) |
    BITMAP(TILE_3s) |
    BITMAP(TILE_6s) |
    BITMAP(TILE_9s) |
    BITMAP(TILE_1p) |
    BITMAP(TILE_4p) |
    BITMAP(TILE_7p),
  BITMAP(TILE_3m) |
    BITMAP(TILE_6m) |
    BITMAP(TILE_9m) |
    BITMAP(TILE_1s) |
    BITMAP(TILE_4s) |
    BITMAP(TILE_7s) |
    BITMAP(TILE_2p) |
    BITMAP(TILE_5p) |
    BITMAP(TILE_8p),
  BITMAP(TILE_3m) |
    BITMAP(TILE_6m) |
    BITMAP(TILE_9m) |
    BITMAP(TILE_2s) |
    BITMAP(TILE_5s) |
    BITMAP(TILE_8s) |
    BITMAP(TILE_1p) |
    BITMAP(TILE_4p) |
    BITMAP(TILE_7p)
];

const FAN_SCORE = [
  0,
  88,
  88,
  88,
  88,
  88,
  88,
  88,
  64,
  64,
  64,
  64,
  64,
  64,
  48,
  48,
  32,
  32,
  32,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  24,
  16,
  16,
  16,
  16,
  16,
  16,
  12,
  12,
  12,
  12,
  12,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  8,
  6,
  6,
  6,
  6,
  6,
  6,
  6,
  4,
  4,
  4,
  4,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  2,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  5
];

const FAN_NAME = [
  "无效番种",
  "大四喜",
  "大三元",
  "绿一色",
  "九莲宝灯",
  "四杠",
  "连七对",
  "十三幺",
  "清幺九",
  "小四喜",
  "小三元",
  "字一色",
  "四暗刻",
  "一色双龙会",
  "一色四同顺",
  "一色四节高",
  "一色四步高",
  "三杠",
  "混幺九",
  "七对",
  "七星不靠",
  "全双刻",
  "清一色",
  "一色三同顺",
  "一色三节高",
  "全大",
  "全中",
  "全小",
  "清龙",
  "三色双龙会",
  "一色三步高",
  "全带五",
  "三同刻",
  "三暗刻",
  "全不靠",
  "组合龙",
  "大于五",
  "小于五",
  "三风刻",
  "花龙",
  "推不倒",
  "三色三同顺",
  "三色三节高",
  "无番和",
  "妙手回春",
  "海底捞月",
  "杠上开花",
  "抢杠和",
  "碰碰和",
  "混一色",
  "三色三步高",
  "五门齐",
  "全求人",
  "双暗杠",
  "双箭刻",
  "全带幺",
  "不求人",
  "双明杠",
  "和绝张",
  "箭刻",
  "圈风刻",
  "门风刻",
  "门前清",
  "平和",
  "四归一",
  "双同刻",
  "双暗刻",
  "暗杠",
  "断幺",
  "一般高",
  "喜相逢",
  "连六",
  "老少副",
  "幺九刻",
  "明杠",
  "缺一门",
  "无字",
  "边张",
  "坎张",
  "单钓将",
  "自摸",
  "花牌",
  "明暗杠"
];

const fanNames = [
  "FAN_INVALID",
  "FAN_DASIXI",
  "FAN_DASANYUAN",
  "FAN_LVYISE",
  "FAN_JIULIANBAODENG",
  "FAN_SIGANG",
  "FAN_LIANQIDUI",
  "FAN_SHISANYAO",
  "FAN_QINGYAOJIU",
  "FAN_XIAOSIXI",
  "FAN_XIAOSANYUAN",
  "FAN_ZIYISE",
  "FAN_SIANKE",
  "FAN_YISESHUANGLONGHUI",
  "FAN_YISESITONGSHUN",
  "FAN_YISESIJIEGAO",
  "FAN_YISESIBUGAO",
  "FAN_SANGANG",
  "FAN_HUNYAOJIU",
  "FAN_QIDUI",
  "FAN_QIXINGBUKAO",
  "FAN_QUANSHUANGKE",
  "FAN_QINGYISE",
  "FAN_YISESANTONGSHUN",
  "FAN_YISESANJIEGAO",
  "FAN_QUANDA",
  "FAN_QUANZHONG",
  "FAN_QUANXIAO",
  "FAN_QINGLONG",
  "FAN_SANSESHUANGLONGHUI",
  "FAN_YISESANBUGAO",
  "FAN_QUANDAIWU",
  "FAN_SANTONGKE",
  "FAN_SANANKE",
  "FAN_QUANBUKAO",
  "FAN_ZUHELONG",
  "FAN_DAYUWU",
  "FAN_XIAOYUWU",
  "FAN_SANFENGKE",
  "FAN_HUALONG",
  "FAN_TUIBUDAO",
  "FAN_SANSESANTONGSHUN",
  "FAN_SANSESANJIEGAO",
  "FAN_WUFANHU",
  "FAN_MIAOSHOUHUICHUN",
  "FAN_HAIDILAOYUE",
  "FAN_GANGSHANGKAIHUA",
  "FAN_QIANGGANGHU",
  "FAN_PENGPENGHU",
  "FAN_HUNYISE",
  "FAN_SANSESANBUGAO",
  "FAN_WUMENQI",
  "FAN_QUANQIUREN",
  "FAN_SHUANGANGANG",
  "FAN_SHUANGJIANKE",
  "FAN_QUANDAIYAO",
  "FAN_BUQIUREN",
  "FAN_SHUANGMINGGANG",
  "FAN_HUJUEZHANG",
  "FAN_JIANKE",
  "FAN_QUANFENGKE",
  "FAN_MENFENGKE",
  "FAN_MENQIANQING",
  "FAN_PINGHU",
  "FAN_SIGUIYI",
  "FAN_SHUANGTONGKE",
  "FAN_SHUANGANKE",
  "FAN_ANGANG",
  "FAN_DUANYAO",
  "FAN_YIBANGAO",
  "FAN_XIXIANGFENG",
  "FAN_LIANLIU",
  "FAN_LAOSHAOFU",
  "FAN_YAOJIUKE",
  "FAN_MINGGANG",
  "FAN_QUEYIMEN",
  "FAN_WUZI",
  "FAN_BIANZHANG",
  "FAN_KANZHANG",
  "FAN_DANDIAOJIANG",
  "FAN_ZIMO",
  "FAN_HUAPAI",
  "FAN_MINGANGANG",
  "FAN_SIZE"
];

const exported = {
  TILE_INVALID,
  TILE_1m,
  TILE_2m,
  TILE_3m,
  TILE_4m,
  TILE_5m,
  TILE_6m,
  TILE_7m,
  TILE_8m,
  TILE_9m,
  TILE_1s,
  TILE_2s,
  TILE_3s,
  TILE_4s,
  TILE_5s,
  TILE_6s,
  TILE_7s,
  TILE_8s,
  TILE_9s,
  TILE_1p,
  TILE_2p,
  TILE_3p,
  TILE_4p,
  TILE_5p,
  TILE_6p,
  TILE_7p,
  TILE_8p,
  TILE_9p,
  TILE_E,
  TILE_S,
  TILE_W,
  TILE_N,
  TILE_C,
  TILE_F,
  TILE_P,
  TILE_MEI,
  TILE_LAN,
  TILE_ZHU,
  TILE_JU,
  TILE_CHU,
  TILE_XIA,
  TILE_QIU,
  TILE_DONG,
  TILE_BAIDA,
  TILE_MAJIANG,
  TILE_SIZE,
  SUIT_INVALID,
  SUIT_WAN,
  SUIT_TIAO,
  SUIT_BING,
  SUIT_HUA,
  SUIT_FENG,
  SUIT_JIAN,
  RANK_INVALID,
  RANK_1,
  RANK_2,
  RANK_3,
  RANK_4,
  RANK_5,
  RANK_6,
  RANK_7,
  RANK_8,
  RANK_9,
  TILE_CHAR_INVALID,
  TILE_CHAR_WAN,
  TILE_CHAR_TIAO,
  TILE_CHAR_BING,
  TILE_CHAR_E,
  TILE_CHAR_S,
  TILE_CHAR_W,
  TILE_CHAR_N,
  TILE_CHAR_C,
  TILE_CHAR_F,
  TILE_CHAR_P,
  TILE_CHAR_MEI,
  TILE_CHAR_LAN,
  TILE_CHAR_ZHU,
  TILE_CHAR_JU,
  TILE_CHAR_CHU,
  TILE_CHAR_XIA,
  TILE_CHAR_QIU,
  TILE_CHAR_DONG,
  PACK_TYPE_INVALID,
  PACK_TYPE_SHUNZI,
  PACK_TYPE_KEZI,
  PACK_TYPE_GANG,
  PACK_TYPE_JIANG,
  PACK_TYPE_ZUHELONG,
  BITMAP,
  TILES_UTF8,
  TILES_SUIT,
  TILES_RANK,
  TILES_SUIT_CHAR,
  TILE_TYPE_BITMAP_WAN,
  TILE_TYPE_BITMAP_TIAO,
  TILE_TYPE_BITMAP_BING,
  TILE_TYPE_BITMAP_SHU,
  TILE_TYPE_BITMAP_FENG,
  TILE_TYPE_BITMAP_JIAN,
  TILE_TYPE_BITMAP_ZI,
  TILE_TYPE_BITMAP_MEANINGFUL,
  TILE_TYPE_BITMAP_YAOJIU,
  TILE_TYPE_BITMAP_LV,
  TILE_TYPE_BITMAP_QUANDA,
  TILE_TYPE_BITMAP_QUANZHONG,
  TILE_TYPE_BITMAP_QUANXIAO,
  TILE_TYPE_BITMAP_DAYUWU,
  TILE_TYPE_BITMAP_XIAOYUWU,
  TILE_TYPE_BITMAP_TUIBUDAO,
  ZuhelongBitmap,
  FAN_SCORE,
  FAN_NAME
};

fanNames.forEach((name, index) => {
  exported[name] = index;
});

module.exports = exported;
