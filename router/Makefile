VERSION=`cat ../VERSION`

build_cont:
	docker build -f ./Dockerfile -t quay.io/containeros/router:$(VERSION) ./

push:
	docker push quay.io/containeros/router:$(VERSION)

deploy: build_cont push

try-to-start-consul:
	docker run -d --name=consul --net=host quay.io/containeros/consul:1.10.1 agent -dev	

start-test-container: build_cont
	docker run -d --name=router-test  --net=host --rm quay.io/containeros/router:$(VERSION)

stop-test-container:
	docker stop router-test
	docker rm router-test

dev: build_cont
	docker run --net=host --name=router-dev -it --rm quay.io/containeros/router:$(VERSION)