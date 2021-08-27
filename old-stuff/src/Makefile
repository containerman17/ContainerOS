VERSION=`cat ../VERSION`

full_test: build_cont
	npm test
	cd ../sdk && npm test
	make e2e

e2e:  build_cont
	cd ../e2e-tests && npm install && npm test
	
release: full_test
	@echo "Release version: $${VERSION}" 
	docker push quay.io/containeros/containeros:$(VERSION)
	cd ../router && make release

build_cont:
	docker build -f ./Dockerfile --build-arg COS_VERSION=$(VERSION) -t quay.io/containeros/containeros:$(VERSION) ../
	cd ../router && make build_cont

run_docker: build_cont
	docker run -it --rm --name cos -v "/var/run/docker.sock:/var/run/docker.sock" --net=host quay.io/containeros/containeros:$(VERSION)