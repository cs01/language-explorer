package main

import (
	"encoding/json"
	"fmt"
	"io"
	"os"
)

type User struct {
	Name   string `json:"name"`
	Age    int    `json:"age"`
	Active bool   `json:"active"`
	Email  string `json:"email"`
}

type Output struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

func main() {
	data, _ := io.ReadAll(os.Stdin)
	var users []User
	if err := json.Unmarshal(data, &users); err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		os.Exit(1)
	}

	var result []Output
	for _, u := range users {
		if u.Active && u.Age > 18 {
			result = append(result, Output{Name: u.Name, Email: u.Email})
		}
	}

	out, _ := json.Marshal(result)
	fmt.Println(string(out))
}
