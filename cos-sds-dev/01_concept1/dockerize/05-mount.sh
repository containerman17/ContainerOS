# completely stuck in here.
# mount doesn't survive on host 

docker rm -f mount;
docker run --name mount --rm  \
    --privileged \
    --net=host --pid=host --ipc=host \
    --cap-add=SYS_ADMIN \
    --volume /:/host \
    ubuntu:focal \
    bash -c "mkdir /host/sds/r0; mount /host/dev/drbd0 /host/sds/r0; echo 'IN DOCKER'; ls -lth /host/sds/r0"; # remove -Y since it would reformat existing

echo "ON HOST"
ls /sds/r0

