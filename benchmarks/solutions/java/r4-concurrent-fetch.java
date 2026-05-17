import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

class ConcurrentFetch {
    static final List<String> URLS = List.of(
        "https://httpbin.org/get",
        "https://httpbin.org/status/404",
        "https://httpbin.org/delay/1",
        "https://httpbin.org/bytes/1024",
        "https://invalid.example.test"
    );

    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(4);
        HttpClient client = HttpClient.newHttpClient();

        List<Future<String>> futures = URLS.stream().map(url -> pool.submit(() -> {
            try {
                HttpRequest req = HttpRequest.newBuilder(URI.create(url)).build();
                HttpResponse<byte[]> resp = client.send(req, HttpResponse.BodyHandlers.ofByteArray());
                return url + ": " + resp.statusCode() + " (" + resp.body().length + " bytes)";
            } catch (Exception e) {
                return url + ": error: " + e.getMessage();
            }
        })).toList();

        for (Future<String> f : futures) {
            System.out.println(f.get());
        }
        pool.shutdown();
    }
}
