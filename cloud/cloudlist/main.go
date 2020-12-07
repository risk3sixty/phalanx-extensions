package main

import (
	"context"
	"fmt"
	"encoding/json"
	"log"
	"os"

	"github.com/projectdiscovery/cloudlist/pkg/inventory"
	"github.com/projectdiscovery/cloudlist/pkg/schema"
)

func main() {
	awsKey := os.Getenv("AWS_ACCESS_KEY_ID")
	awsSecret := os.Getenv("AWS_SECRET_ACCESS_KEY")
	if len(awsKey) == 0 || len(awsSecret) == 0 {
		log.Fatalf("%s\n", "Make sure your AWS key and secret are populated")
	}

	inventory, err := inventory.New(schema.Options{
		schema.OptionBlock{
			"provider": "aws",
			"profile": "production",
			"aws_access_key": awsKey,
			"aws_secret_key": awsSecret,
		},
	})
	if err != nil {
		log.Fatalf("%s\n", err)
	}

	for _, provider := range inventory.Providers {
		resources, err := provider.Resources(context.Background())
		if err != nil {
			log.Fatalf("%s\n", err)
		}
		for _, resource := range resources.Items {
			res, err := json.Marshal(resource)
			if err != nil {
				log.Fatalf("%s\n", err)
			}
			fmt.Println(string(res))
		}
	}
}