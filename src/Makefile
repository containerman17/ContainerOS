VERSION=`cat ../VERSION`

release: pushall

i: 
	docker build -f ./Dockerfile.installer -t quay.io/containeros/installer:${VERSION} ./
	docker tag quay.io/containeros/installer:${VERSION} quay.io/containeros/installer:latest

a: 
	docker build -f ./Dockerfile.api -t quay.io/containeros/api:${VERSION} ./
	docker tag quay.io/containeros/api:${VERSION} quay.io/containeros/api:latest

n: 
	docker build -f ./Dockerfile.node-setup -t quay.io/containeros/node-setup:${VERSION} ./
	docker tag quay.io/containeros/node-setup:${VERSION} quay.io/containeros/node-setup:latest

pushall: push-installer push-api push-node-setup

push-installer: i
	docker push quay.io/containeros/installer:${VERSION}
	docker push quay.io/containeros/installer:latest

push-api: a
	docker push quay.io/containeros/api:${VERSION}
	docker push quay.io/containeros/api:latest

push-node-setup: n
	docker push quay.io/containeros/node-setup:${VERSION}
	docker push quay.io/containeros/node-setup:latest