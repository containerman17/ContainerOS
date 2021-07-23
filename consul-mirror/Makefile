VERSION=1.10.0
deploy: build push

build:
	docker build -t quay.io/containeros/consul:$(VERSION) .

push:
	docker push quay.io/containeros/consul:$(VERSION)