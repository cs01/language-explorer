#include <httplib.h>
#include <nlohmann/json.hpp>
#include <string>

using json = nlohmann::json;

int main() {
    httplib::Server svr;

    svr.Get("/hello", [](const httplib::Request& req, httplib::Response& res) {
        std::string name = req.has_param("name") ? req.get_param_value("name") : "World";
        json body = {{"greeting", "Hello, " + name + "!"}};
        res.set_content(body.dump(), "application/json");
    });

    svr.set_default_headers({{"Content-Type", "application/json"}});
    svr.set_error_handler([](const httplib::Request&, httplib::Response& res) {
        json body = {{"error", "not found"}};
        res.status = 404;
        res.set_content(body.dump(), "application/json");
    });

    svr.listen("0.0.0.0", 8080);
    return 0;
}
