# KrakenKV

The goal is to prototype a database that keeps running as long as any single node survives

# API

## Gate

#### GET `/kv/some/key?recurse=true|false&wait=1633641109482`
Returns key-value pair. Add `recurse=true` for all keys starting with this value. Add `wait=[ts]` to get only keys updated after ts as long as any information appears. `wait` works only with `recurse`.

#### POST `/kv/some/key?check_ts=1633641109482`
Update key. If `check_ts` is given, will update only if current `ts` equal given `check_ts`.

## Store
[To be replaced with redis spiced up with Lua]
#### GET `/sync/bulk`
Returns all keys and values at the moment

#### POST `/sync/bulk`
Will store all the given keys and values if their `ts` is greater then stored `ts`

# Sync logic
Gate on successful set:
- Send update to every node

Gate on successful connection:
- Download all the data from the node
- Perform set for every key with ts greater then on gate (plus send to all nodes obviously)
- Dump current database into the node