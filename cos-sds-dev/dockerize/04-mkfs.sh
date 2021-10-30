
docker rm -f mkfs;
docker run -it --name mkfs --rm  \
    --privileged \
    ubuntu:focal \
    bash -c "mkfs.ext4 -F /dev/drbd0" # remove -Y since it would reformat existing
