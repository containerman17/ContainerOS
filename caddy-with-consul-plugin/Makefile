VERSION=v2
deploy: build push

build:
	docker build -t quay.io/containeros/caddy-with-consul-plugin:$(VERSION) .

push:
	docker push quay.io/containeros/caddy-with-consul-plugin:$(VERSION)