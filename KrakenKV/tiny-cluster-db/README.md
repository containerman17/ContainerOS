# Tiny Cluster DB

## Use case

You need to store Key-value data in your app but you don't have access to persistent storage. Works perfectly for Kubernetes, Docker Swarm, Hashicorp nomad and other distributed systems. Made for [ContainerOS](https://containeros.org) project.

## How it works

### Database
Database stores actual key-value-timestamp data. It streams all the updates via HTTP to any backup node connecting to it. Exchanges data with backup nodes on start.
Can be only a single instance if you don't want your data to be corrupted. If you need multiple instances, you can have a single Database instance and talk to it via some kind of API.

### Backup Node
It listens to the updates from Database and stores them in memory. 3 instances recommended.


## Example

`app.js`
```javascript
const { Database } = require('tiny-cluster-db');

//create an instance and bind it to port 9999, can be any port
const db = new Database({ port: 9999 })

//set a value
await db.set('my/key1', 'someval')
// get value and ts
const {ts, value} = await db.get('my/key2') 
// get only value
const onlyValue = await db.getValue('my/key') 

//get all values with key starting with 'my/'
const allMyVals = await db.getRecurse('my/')


//db.safeUpdate would execute update function only if it hasn't changed since ts
//if value changed, it would re-execute update function and save new value

await db.set('my/safepatch', 0)
const updaterFunc = function (val) {//accept old value
    return val+1//return new value
}
for (let i = 0; i < 30; i++) {
    db.safeUpdate('my/safepatch', updaterFunc) //Of course you have to handle a promise rejection
}
```

`backupNode.js`
```javascript
const { BackupNode } = require('tiny-cluster-db');
new BackupNode({ 
    dbHost: 'myapp', //host of the database, can be localhost for testing purposes
    dbPort: 9999, //the same port you set in 'new Database(...)'
})
```