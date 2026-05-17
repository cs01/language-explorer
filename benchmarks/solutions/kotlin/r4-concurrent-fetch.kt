import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Semaphore
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse

val urls = listOf(
    "https://httpbin.org/get",
    "https://httpbin.org/status/404",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/bytes/1024",
    "https://invalid.example.test",
)

fun main() = runBlocking {
    val client = HttpClient.newHttpClient()
    val semaphore = Semaphore(4)

    val results = urls.map { url ->
        async(Dispatchers.IO) {
            semaphore.acquire()
            try {
                val req = HttpRequest.newBuilder(URI.create(url)).build()
                val resp = client.send(req, HttpResponse.BodyHandlers.ofByteArray())
                "$url: ${resp.statusCode()} (${resp.body().size} bytes)"
            } catch (e: Exception) {
                "$url: error: ${e.message}"
            } finally {
                semaphore.release()
            }
        }
    }

    results.forEach { println(it.await()) }
}
