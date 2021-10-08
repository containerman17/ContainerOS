VERSION=`cat ./VERSION`

dev:
	docker compose build
	docker compose up -d
	sleep 2
	docker ps
	docker compose logs -f

release:
	docker build -f Dockerfile.store -t quay.io/containeros/krakenkv-store:${VERSION} .
	docker build -f Dockerfile.gate -t quay.io/containeros/krakenkv-gate:${VERSION} .
	docker push quay.io/containeros/krakenkv-store:${VERSION}
	docker push quay.io/containeros/krakenkv-gate:${VERSION}

	docker tag quay.io/containeros/krakenkv-store:${VERSION} quay.io/containeros/krakenkv-store:latest
	docker tag quay.io/containeros/krakenkv-gate:${VERSION} quay.io/containeros/krakenkv-gate:latest

	docker push quay.io/containeros/krakenkv-store:latest
	docker push quay.io/containeros/krakenkv-gate:latest