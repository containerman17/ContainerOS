cat <<EOF > /etc/drbd.d/r0.res
resource r0 {
  on linstor-test-1 {
    device    /dev/drbd1;
    disk      /dev/vg/lvmthinpool;
    address   95.217.131.185:7789;
    meta-disk internal;
    node-id   1;
  }
  on linstor-test-2 {
    device    /dev/drbd1;
    disk      /dev/vg/lvmthinpool;
    address   65.108.86.219:7789;
    meta-disk internal;
    node-id   2;
  }
  connection-mesh {
	hosts     linstor-test-1 linstor-test-2;
  }
}
EOF

cat <<EOF > /etc/drbd.d/global_common.conf
global {
  usage-count yes;
}
common {
  net {
    protocol C;

    #after-sb-0pri discard-least-changes;
    #after-sb-1pri call-pri-lost-after-sb;
    #after-sb-2pri disconnect;

  }
}
EOF

drbdadm adjust all