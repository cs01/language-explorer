import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.URI;

class HttpServerMain {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);

        server.createContext("/hello", exchange -> {
            URI uri = exchange.getRequestURI();
            String query = uri.getQuery();
            String name = "World";
            if (query != null) {
                for (String param : query.split("&")) {
                    String[] kv = param.split("=", 2);
                    if (kv[0].equals("name") && kv.length > 1) name = kv[1];
                }
            }
            String json = "{\"greeting\":\"Hello, " + name + "!\"}";
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, json.length());
            exchange.getResponseBody().write(json.getBytes());
            exchange.close();
        });

        server.createContext("/", exchange -> {
            String json = "{\"error\":\"not found\"}";
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(404, json.length());
            exchange.getResponseBody().write(json.getBytes());
            exchange.close();
        });

        server.start();
    }
}
