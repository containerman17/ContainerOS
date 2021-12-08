const { NodeVM, VMScript } = require('vm2');
const fs = require('fs');
const path = require('path');
const CUSTOM_CODE_FOLDER = path.join(__dirname, './custom_code/');

const vm = new NodeVM({
    console: 'inherit',
    sandbox: {},
    require: {
        builtin: ['assert', 'buffer', 'child_process', 'console', 'cluster', 'crypto', 'dgram', 'dns', 'events', 'http', 'http2', 'https', 'net', 'path', 'querystring', 'readline', 'repl', 'stream', 'string_decoder', 'timers', 'tls', 'tty', 'url', 'util', 'v8', 'wasi', 'worker', 'zlib'],
        root: CUSTOM_CODE_FOLDER,
        external: {
            modules: ['*'],
            transitive: true
        },
        context: 'sandbox',
    }
});

let scriptCompiled = null;
try {
    const sourcePath = path.join(CUSTOM_CODE_FOLDER, 'function.js')
    const scriptText = fs.readFileSync(sourcePath).toString();
    console.log('scriptText', scriptText);
    scriptCompiled = new VMScript(scriptText, { filename: sourcePath }).compile();
} catch (err) {
    console.error('Failed to compile script.', err);
}

let result
try {
    result = vm.run(scriptCompiled);
    result(1, 2, 3).then(console.log);
    result(1, 2, 3).then(console.log);
    result(1, 2, 3).then(console.log);
    result(1, 2, 3).then(console.log);

} catch (err) {
    console.error('Failed to execute script.', err);
}

process.on('uncaughtException', (err) => {
    console.error('Asynchronous error caught.', err);
})