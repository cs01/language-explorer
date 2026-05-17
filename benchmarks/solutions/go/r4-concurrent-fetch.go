package main

import (
	"fmt"
	"io"
	"net/http"
	"sync"
)

func main() {
	urls := []string{
		"https://httpbin.org/get",
		"https://httpbin.org/status/404",
		"https://httpbin.org/delay/1",
		"https://httpbin.org/bytes/1024",
		"https://invalid.example.test",
	}

	sem := make(chan struct{}, 4)
	var wg sync.WaitGroup

	for _, url := range urls {
		wg.Add(1)
		sem <- struct{}{}
		go func(u string) {
			defer wg.Done()
			defer func() { <-sem }()

			resp, err := http.Get(u)
			if err != nil {
				fmt.Printf("%s: error: %v\n", u, err)
				return
			}
			defer resp.Body.Close()
			body, _ := io.ReadAll(resp.Body)
			fmt.Printf("%s: %d (%d bytes)\n", u, resp.StatusCode, len(body))
		}(url)
	}
	wg.Wait()
}
