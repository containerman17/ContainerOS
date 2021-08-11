VERSION=`cat ../VERSION`

test_cont: build_cont
	# cd ../sdk && npm test
	# npm test
	cd ../e2e-tests && npm install && npm test
	
release: test_cont
	@echo "Release version: $${VERSION}"
	docker push quay.io/containeros/containeros:$(VERSION)

build_cont:
	docker build -f ./Dockerfile -t quay.io/containeros/containeros:$(VERSION) ../
