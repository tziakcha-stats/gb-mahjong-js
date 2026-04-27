#include "fan.h"
#include <iostream>
#include <string>
#include <vector>

using namespace mahjong;

static void PrintPacks(const std::vector<Pack> &packs) {
    std::cout << "PACKS";
    for (const auto &pack : packs) {
        std::cout << ' ' << pack.GetType() << ',' << pack.GetMiddleTile().GetId() << ',' << pack.GetZuhelongType() << ',' << pack.GetOffer();
    }
    std::cout << '\n';
}

static void PrintFanTable(const Fan &fan) {
    for (int fan_id = 1; fan_id < FAN_SIZE; fan_id++) {
        for (const auto &entry : fan.fan_table_res[fan_id]) {
            std::cout << "FAN " << fan_id;
            for (const auto &pack_id : entry) {
                std::cout << ' ' << pack_id;
            }
            std::cout << '\n';
        }
    }
}

int main(int argc, char **argv) {
    if (argc < 3) {
        std::cerr << "usage: gb_mahjong_bridge <command> <hand> [arg]" << std::endl;
        return 1;
    }

    const std::string command = argv[1];
    const std::string hand = argv[2];

    Handtiles ht;
    const int parse_result = ht.StringToHandtiles(hand);
    if (parse_result != 0) {
        std::cout << "ERR " << parse_result;
        return 0;
    }

    Fan fan;
    if (command == "judge-hu") {
        std::cout << "OK " << fan.JudgeHu(ht);
        return 0;
    }

    if (command == "calc-ting") {
        bool include_exhausted_tile = false;
        if (argc >= 4) {
            include_exhausted_tile = std::string(argv[3]) == "1";
        }
        const std::vector<Tile> ting = fan.CalcTing(ht, include_exhausted_tile);
        std::cout << "OK";
        for (const auto &tile : ting) {
            std::cout << " " << tile.GetId();
        }
        return 0;
    }

    if (command == "count-fan") {
        fan.CountFan(ht);
        std::cout << "OK " << fan.tot_fan_res << '\n';
        PrintPacks(fan.fan_packs_res);
        PrintFanTable(fan);
        return 0;
    }

    std::cerr << "unknown command: " << command << std::endl;
    return 2;
}
