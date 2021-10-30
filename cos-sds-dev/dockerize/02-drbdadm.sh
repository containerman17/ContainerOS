
cat <<EOF > ./drbdadm.dockerfile
FROM ubuntu:focal-20211006

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends software-properties-common && \
    add-apt-repository ppa:linbit/linbit-drbd9-stack && \
    apt-get update -y && \
    apt-get install -y --no-install-recommends drbd-utils && \
    apt-get remove --purge -y software-properties-common && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

EOF

docker build -t drbdadm -f drbdadm.dockerfile .

docker rm -f drbdadm;
docker run -it --rm \
    --name drbdadm \
    --hostname=$(hostname) \
    -v /etc/drbd.d:/etc/drbd.d \
    -v /run:/run \
    --net=host \
    --privileged \
    drbdadm \
    /bin/bash -c "echo 'FROM DOCKER'; drbdadm status all; drbdadm primary r0; sleep 1; drbdadm status all;"; echo "FROM HOST:"; drbdadm status all
    #/bin/bash -c "drbdadm status all; drbdadm primary r0; sleep 1; drbdadm status all; drbdadm secondary r0; sleep 1; drbdadm status r0"

#docker run --rm --net=host--pid=host -v /usr:/usr -v /etc:/etc -v /run:/run --privileged ubuntu:focal bash -c "drbdadm status"
