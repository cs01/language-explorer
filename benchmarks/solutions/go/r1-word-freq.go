package main

import (
	"fmt"
	"os"
	"sort"
	"strings"
	"unicode"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintln(os.Stderr, "error: no file argument")
		os.Exit(1)
	}

	data, err := os.ReadFile(os.Args[1])
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	counts := make(map[string]int)
	for _, word := range strings.FieldsFunc(strings.ToLower(string(data)), func(c rune) bool {
		return !unicode.IsLetter(c)
	}) {
		counts[word]++
	}

	type pair struct {
		word  string
		count int
	}
	pairs := make([]pair, 0, len(counts))
	for w, c := range counts {
		pairs = append(pairs, pair{w, c})
	}
	sort.Slice(pairs, func(i, j int) bool {
		if pairs[i].count != pairs[j].count {
			return pairs[i].count > pairs[j].count
		}
		return pairs[i].word < pairs[j].word
	})

	for i := 0; i < 10 && i < len(pairs); i++ {
		fmt.Printf("%s: %d\n", pairs[i].word, pairs[i].count)
	}
}
