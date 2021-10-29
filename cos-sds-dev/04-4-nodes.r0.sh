cat <<EOF > /etc/drbd.d/r0.res
resource r0 {
    device    /dev/drbd0;
    disk      /dev/vg/r0;
    meta-disk internal;

    on linstor-test-1 {
        address     95.217.131.185:7789;
        node-id     0;
    }
    on linstor-test-2 {
       address     65.108.86.219:7789;
       node-id     1;
    }
    on linstor-test-3 {
        address     135.181.192.104:7789;
        node-id     2;
    }

    # on linstor-test-4 {
    #     disk      none;
    #     address   65.21.48.216:7789;
    #     node-id   4;
    # }

    connection-mesh {
	    #hosts     linstor-test-1 linstor-test-2 linstor-test-3 linstor-test-4;
        hosts     linstor-test-1 linstor-test-2 linstor-test-3;
    }
}
EOF

cat <<EOF > /etc/drbd.d/global_common.conf
global {
  usage-count yes;
}
common {
  net {
    protocol B;

    after-sb-0pri discard-least-changes;
    after-sb-1pri call-pri-lost-after-sb;
    after-sb-2pri disconnect;

  }
}
EOF

grep -qxF '95.217.131.185 linstor-test-1' /etc/hosts || echo '95.217.131.185 linstor-test-1' >> /etc/hosts
grep -qxF '65.108.86.219 linstor-test-2' /etc/hosts || echo '65.108.86.219 linstor-test-2' >> /etc/hosts
grep -qxF '135.181.192.104 linstor-test-3' /etc/hosts || echo '135.181.192.104 linstor-test-3' >> /etc/hosts
grep -qxF '65.21.48.216 linstor-test-4' /etc/hosts || echo '65.21.48.216 linstor-test-4' >> /etc/hosts

cat /etc/hosts

# drbdadm adjust r0
# sleep 2
# drbdadm status all



