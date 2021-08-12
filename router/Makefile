VERSION=v2

build:
	docker build -f ./Dockerfile -t quay.io/containeros/router:$(VERSION) ./

push:
	docker push quay.io/containeros/router:$(VERSION)

deploy: build push

dev: build
	docker run --net=host -it --rm  quay.io/containeros/router:$(VERSION)