import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.routing.*
import io.ktor.server.response.*
import io.ktor.http.*
import kotlinx.serialization.json.*

fun main() {
    embeddedServer(Netty, port = 8080) {
        routing {
            get("/hello") {
                val name = call.request.queryParameters["name"] ?: "World"
                call.respondText(
                    """{"greeting":"Hello, $name!"}""",
                    ContentType.Application.Json
                )
            }
            route("{...}") {
                handle {
                    call.respondText(
                        """{"error":"not found"}""",
                        ContentType.Application.Json,
                        HttpStatusCode.NotFound
                    )
                }
            }
        }
    }.start(wait = true)
}
