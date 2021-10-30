
docker rm -f lvm;
docker run -it --name lvm  --pid=host \
    -v /bin:/bin \
    -v /usr:/usr \
    -v /etc:/etc \
    -v /run:/run \
    -v /dev:/dev \
    --privileged \
    ubuntu:focal \
    bash -c "lvs; timeout 3 lvcreate -V1G -T vg/lvmthinpool -y -n r8; lvs"


