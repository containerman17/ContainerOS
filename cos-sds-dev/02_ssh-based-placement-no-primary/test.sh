drbdadm create-md testvol2 --force;
drbdadm up testvol2;
drbdadm primary testvol2 --force;
mkfs.ext4 /dev/drbd1 -F;
drbdadm secondary testvol2;

