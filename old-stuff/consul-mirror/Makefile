VERSION=1.10.1
deploy:
	docker buildx build --platform linux/amd64,linux/arm64 -t quay.io/containeros/consul:$(VERSION) --push .
