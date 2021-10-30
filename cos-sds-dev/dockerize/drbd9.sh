
cat <<EOF > ./DRBD9.dockerfile
FROM ubuntu:focal

ARG DRBD_VERSION

RUN apt-get update && apt-get upgrade -y && apt-get install -y kmod gnupg wget make gcc patch curl && apt-get clean

RUN wget https://pkg.linbit.com/downloads/drbd/9.0/drbd-\${DRBD_VERSION}.tar.gz -O /drbd.tar.gz && \
    wget https://raw.githubusercontent.com/LINBIT/drbd/drbd-9.0/docker/entry.sh -O /entry.sh

ENV LB_HOW compile
RUN chmod +x /entry.sh
ENTRYPOINT /entry.sh
EOF

docker build -t my/local/drbd9 --build-arg DRBD_VERSION=9.1.4-1 -f DRBD9.dockerfile .

docker rm -f drbd9;
docker run -it --rm --name drbd9 --cap-add sys_module my/local/drbd9

