Goals of this research project:
1. [Done] Place a diskfull DRBD nodes on 3 different hosts automatically
2. [Done] Try to first place all three nodes and only then initialize the DRBD configuration
3. Simulate volume request from a node, then create a new volume with primary on that node
4. Mount volume to a dir on primary
4. Simulate moving between diskfull nodes
5. Simulate moving to diskfull node
6. Simulate diskfull 8GB moving with 30 seconds delay. Is it going to be diskless in the first minute?
7. Simulate diskfull node failure
8. Simulate diskless node failure
9. Simulate 2 diskfull nodes failure. 3 DF+2 DL nodes required
10. See what's going to happen when disk overflow occures
11. Try to detect an underlying storege by OS info or disk stats
12. Sort nodes for placement by some algo (may be free disk + disk load)