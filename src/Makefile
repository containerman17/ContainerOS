VERSION=`cat ../VERSION`

release_cont: build_cont test_cont
	@echo "Release version: $${VERSION}"
	docker push quay.io/containeros/containeros:$(VERSION)

build_cont:
	docker build -t quay.io/containeros/containeros:$(VERSION) .

test_cont:
	cd ../e2e-tests && npm install && npm test