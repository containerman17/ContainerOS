
docker rm -f lvm;
docker run -it --name lvm  \
    -v /usr:/usr \
    --privileged \
    ubuntu:focal \
    bash -c "lvs; lvcreate -V1G -T vg/lvmthinpool -y -n testvol; lvs; lvremove vg/testvol -y; lvs;"


