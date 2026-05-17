import kotlinx.coroutines.*
import kotlinx.coroutines.channels.*

fun CoroutineScope.producer() = produce {
    for (i in 1..20) send(i)
}

fun CoroutineScope.filterOdd(input: ReceiveChannel<Int>) = produce {
    for (v in input) {
        if (v % 2 == 1) send(v)
    }
}

fun main() = runBlocking {
    val numbers = producer()
    val odds = filterOdd(numbers)
    for (v in odds) {
        println(v)
    }
}
