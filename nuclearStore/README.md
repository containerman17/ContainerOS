# KrakenKV

The goal is to prototype a database that keeps running as long as any single node survives.

It constists of 2 components - gate, which is database itself and store, which just backs up data in case of gate death/restart.

KrakenKV is made for non-persistent/ephemeral storage. It works well with emptyDir and local docker volumes. 

## Use

- Deploy one and only one copy of date
- Deploy 1-5 copies of store. 3 recommended
- 
You can deploy it as services in docker swarm or deployments in Kubernetes.

## Roadmap
[-] Release sdk to npm
[-] Release docker images to quay.io
[-] Persist data on disk
[-] Switch to leveldb or something like that persists data

# API

#### GET `/kv/some/key?recurse=true|false&wait=1633641109482`
Returns key-value pair. Add `recurse=true` for all keys starting with this value. Add `wait=[ts]` to get only keys updated after ts as long as any information appears. `wait` works only with `recurse`.

#### POST `/kv/`
Update key. If `checkTs` is given, will update only if current `ts` equal given `check_ts`. Also accepts `key` and `value`.

# Sync logic
Gate on successful set:
- Send update to every node

Gate on successful connection:
- Download all the data from the node
- Perform set for every key with ts greater then on gate (plus send to all nodes obviously)
- Dump current database into the node