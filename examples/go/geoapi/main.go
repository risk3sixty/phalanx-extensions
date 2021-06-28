package main

import (
	"fmt"

	geoapigo "github.com/risk3sixty/geoapi-go"
)

func main() {
	res, err := geoapigo.Get("me")
	if err != nil {
		panic(err)
	}
	fmt.Printf("%+v\n", res)
}