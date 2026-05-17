#include <iostream>
#include <sstream>
#include <nlohmann/json.hpp>

using json = nlohmann::json;

int main() {
    std::stringstream buf;
    buf << std::cin.rdbuf();

    json users;
    try {
        users = json::parse(buf.str());
    } catch (const json::parse_error& e) {
        std::cerr << "error: " << e.what() << "\n";
        return 1;
    }

    json result = json::array();
    for (const auto& u : users) {
        if (u["active"].get<bool>() && u["age"].get<int>() > 18) {
            result.push_back({{"name", u["name"]}, {"email", u["email"]}});
        }
    }

    std::cout << result.dump() << "\n";
    return 0;
}
