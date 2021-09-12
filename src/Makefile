VERSION=`cat ../VERSION`

release: a i n push

i: 
	docker build -f ./Dockerfile.installer -t quay.io/containeros/installer:${VERSION} ./
	docker tag quay.io/containeros/installer:${VERSION} quay.io/containeros/installer:latest

a: 
	docker build -f ./Dockerfile.api -t quay.io/containeros/api:${VERSION} ./
	docker tag quay.io/containeros/api:${VERSION} quay.io/containeros/api:latest

n: 
	docker build -f ./Dockerfile.node-setup -t quay.io/containeros/node-setup:${VERSION} ./
	docker tag quay.io/containeros/node-setup:${VERSION} quay.io/containeros/node-setup:latest

push:
	docker push quay.io/containeros/installer:${VERSION}
    docker push quay.io/containeros/installer:latest
	docker push quay.io/containeros/api:${VERSION}
	docker push quay.io/containeros/api:latest
	docker push quay.io/containeros/node-setup:${VERSION}
	docker push quay.io/containeros/node-setup:latest
