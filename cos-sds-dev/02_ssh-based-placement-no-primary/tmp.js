const tmp = require('tmp');

const tmpobj = tmp.fileSync();
console.log('File: ', tmpobj.name);

tmpobj.removeCallback();