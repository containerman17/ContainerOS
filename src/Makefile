VERSION=`cat ../VERSION`

all: installer_cont api_cont node_cont

i: installer_cont
a: api_cont
n: node_cont

installer_cont:
	docker build -f ./Dockerfile.installer -t quay.io/containeros/installer:$(VERSION) ./
	#docker push quay.io/containeros/installer:$(VERSION)
	docker tag quay.io/containeros/installer:$(VERSION) quay.io/containeros/installer:latest
    #docker push quay.io/containeros/installer:latest

api_cont:
	docker build -f ./Dockerfile.api -t quay.io/containeros/api:$(VERSION) ./
	#docker push quay.io/containeros/api:$(VERSION)
	docker tag quay.io/containeros/api:$(VERSION) quay.io/containeros/api:latest
    #docker push quay.io/containeros/api:latest

node_cont:
	docker build -f ./Dockerfile.node-setup -t quay.io/containeros/node-setup:$(VERSION) ./
	#docker push quay.io/containeros/node-setup:$(VERSION)
	docker tag quay.io/containeros/node-setup:$(VERSION) quay.io/containeros/node-setup:latest
    #docker push quay.io/containeros/node-setup:latest