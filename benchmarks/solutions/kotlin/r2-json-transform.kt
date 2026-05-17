import kotlinx.serialization.*
import kotlinx.serialization.json.*

@Serializable
data class User(val name: String, val age: Int, val active: Boolean, val email: String)

@Serializable
data class Output(val name: String, val email: String)

fun main() {
    val input = System.`in`.bufferedReader().readText()
    val users = try {
        Json.decodeFromString<List<User>>(input)
    } catch (e: Exception) {
        System.err.println("error: ${e.message}")
        kotlin.system.exitProcess(1)
    }

    val result = users
        .filter { it.active && it.age > 18 }
        .map { Output(it.name, it.email) }

    println(Json.encodeToString(result))
}
