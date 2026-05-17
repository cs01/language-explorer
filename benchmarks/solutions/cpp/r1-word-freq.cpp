#include <algorithm>
#include <cctype>
#include <fstream>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "error: no file argument\n";
        return 1;
    }

    std::ifstream file(argv[1]);
    if (!file) {
        std::cerr << "error: cannot open " << argv[1] << "\n";
        return 1;
    }

    std::unordered_map<std::string, int> counts;
    std::string word;
    char c;

    while (file.get(c)) {
        if (std::isalpha(static_cast<unsigned char>(c))) {
            word += std::tolower(static_cast<unsigned char>(c));
        } else if (!word.empty()) {
            counts[word]++;
            word.clear();
        }
    }
    if (!word.empty()) counts[word]++;

    std::vector<std::pair<std::string, int>> sorted(counts.begin(), counts.end());
    std::sort(sorted.begin(), sorted.end(), [](const auto& a, const auto& b) {
        return a.second != b.second ? a.second > b.second : a.first < b.first;
    });

    for (int i = 0; i < 10 && i < static_cast<int>(sorted.size()); i++) {
        std::cout << sorted[i].first << ": " << sorted[i].second << "\n";
    }
    return 0;
}
