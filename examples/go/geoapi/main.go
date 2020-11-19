package main

import (
	"fmt"

	geoapigo "github.com/Risk3sixty-Labs/geoapi-go"
)

func main() {
	res, err := geoapigo.Get("me")
	if err != nil {
		panic(err)
	}
	fmt.Printf("%+v\n", res)
}