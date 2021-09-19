VERSION=`cat ../VERSION`

release: a i n pushall

i: 
	docker build -f ./Dockerfile.installer -t quay.io/containeros/installer:${VERSION} ./
	docker tag quay.io/containeros/installer:${VERSION} quay.io/containeros/installer:latest

a: 
	docker build -f ./Dockerfile.api -t quay.io/containeros/api:${VERSION} ./
	docker tag quay.io/containeros/api:${VERSION} quay.io/containeros/api:latest

n: 
	docker build -f ./Dockerfile.node-setup -t quay.io/containeros/node-setup:${VERSION} ./
	docker tag quay.io/containeros/node-setup:${VERSION} quay.io/containeros/node-setup:latest

pushall:
	docker push quay.io/containeros/installer:${VERSION}
	docker push quay.io/containeros/installer:latest
	docker push quay.io/containeros/api:${VERSION}
	docker push quay.io/containeros/api:latest
	docker push quay.io/containeros/node-setup:${VERSION}
	docker push quay.io/containeros/node-setup:latest

dev-env:
	docker rm -f consul || true
	 docker run --name consul -d --net=host consul agent -dev -ui
	docker rm -f registry || true
	 docker run --name registry -d -p 5000:5000 --net=host --env-file=.env -e REGISTRY_HTTP_ADDR=0.0.0.0:5000 -e REGISTRY_STORAGE=s3 -e REGISTRY_HTTP_DEBUG_ADDR=0.0.0.0:5001 registry:2