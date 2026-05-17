package main

import "fmt"

func producer(out chan<- int) {
	for i := 1; i <= 20; i++ {
		out <- i
	}
	close(out)
}

func filterOdd(in <-chan int, out chan<- int) {
	for v := range in {
		if v%2 == 1 {
			out <- v
		}
	}
	close(out)
}

func main() {
	ch1 := make(chan int)
	ch2 := make(chan int)

	go producer(ch1)
	go filterOdd(ch1, ch2)

	for v := range ch2 {
		fmt.Println(v)
	}
}
