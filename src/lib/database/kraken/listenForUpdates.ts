import krakenkv from "./krakenKV"

const watches = {}
const lastStates: { [key: string]: any } = {}

export default function (key: string, callback: (result: { [key: string]: any }) => void) {
    if (!watches[key]) {
        watches[key] = krakenkv.watch(key)

        watches[key].on('error', function (err) {
            console.error(`watch error on key ${key}:`, err);
            process.exit(1)
        });
    }

    if (key in lastStates) {
        callback(lastStates[key])//dirty hack for delayed listeners
    }

    watches[key].on('data', function (data) {
        const result: { [key: string]: any } = {}

        for (let key in data) {
            result[key] = JSON.parse(data[key].value)
        }

        lastStates[key] = result//dirty hack for delayed listeners
        callback(result)
    });
}