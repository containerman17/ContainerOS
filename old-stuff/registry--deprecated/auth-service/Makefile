VERSION=`cat ../../VERSION`


deploy: dummy_certs push-auth push-reg

build-auth:
	docker build -f Dockerfile.auth_service -t quay.io/containeros/auth-service:${VERSION} .

push-auth: build-auth
	docker tag quay.io/containeros/auth-service:${VERSION} quay.io/containeros/auth-service:latest
	docker push quay.io/containeros/auth-service:${VERSION}
	docker push quay.io/containeros/auth-service:latest

build-reg:
	docker build -f Dockerfile.registry -t quay.io/containeros/registry:${VERSION} .

push-reg: build-reg
	docker tag quay.io/containeros/registry:${VERSION} quay.io/containeros/registry:latest
	docker push quay.io/containeros/registry:${VERSION}
	docker push quay.io/containeros/registry:latest


dummy_certs:
	mkdir dummy_certs
	openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout dummy_certs/dummy_key.key -out dummy_certs/dummy_cert.pem