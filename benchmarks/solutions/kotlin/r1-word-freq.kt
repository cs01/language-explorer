import java.io.File

fun main(args: Array<String>) {
    if (args.isEmpty()) {
        System.err.println("error: no file argument")
        kotlin.system.exitProcess(1)
    }

    val text = try {
        File(args[0]).readText().lowercase()
    } catch (e: Exception) {
        System.err.println("error: ${e.message}")
        kotlin.system.exitProcess(1)
    }

    text.split(Regex("[^a-z]+"))
        .filter { it.isNotEmpty() }
        .groupingBy { it }
        .eachCount()
        .entries
        .sortedWith(compareByDescending<Map.Entry<String, Int>> { it.value }.thenBy { it.key })
        .take(10)
        .forEach { println("${it.key}: ${it.value}") }
}
