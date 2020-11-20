tar -czf geoapi.tgz -C examples/typescript/geoapi .
# endpoint is in the extension-engine repo
curl -F 'repo=@geoapi.tgz' http://localhost:8000/image/build
rm geoapi.tgz