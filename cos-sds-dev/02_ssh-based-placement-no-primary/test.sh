drbdadm create-md testvol --force;
drbdadm up testvol;
drbdadm primary testvol --force;
mkfs.ext4 /dev/drbd1 -F;
drbdadm secondary testvol;

