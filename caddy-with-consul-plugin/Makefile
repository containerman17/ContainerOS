VERSION=v2

build:
	docker build -t quay.io/containeros/caddy-with-consul-plugin:$(VERSION) .

push:
	docker push quay.io/containeros/caddy-with-consul-plugin:$(VERSION)

deploy: build push

dev: build
	docker run --net=host -it --rm -v $$(pwd)/worker:/app/worker  quay.io/containeros/caddy-with-consul-plugin:$(VERSION)