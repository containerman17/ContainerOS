import consul from "./consulInstance"

const watches = {}
const lastStates: { [key: string]: any } = {}

export default function (key: string, callback: (result: { [key: string]: any }) => void) {
    if (!watches[key]) {
        watches[key] = consul.watch({
            method: consul.kv.get,
            options: { key, recurse: true },
            backoffFactor: 1000,
            maxAttempts: 500
        });

        watches[key].on('error', function (err) {
            console.error(`watch error on key ${key}:`, err);
            process.exit(1)
        });
    }

    if (key in lastStates) {
        callback(lastStates[key])//dirty hack for delayed listeners
    }

    watches[key].on('change', function (data, res) {
        const result: { [key: string]: any } = {}
        if (data !== undefined) {
            for (let item of data || []) {
                result[item.Key] = JSON.parse(item.Value)
            }
        }
        lastStates[key] = result//dirty hack for delayed listeners
        callback(result)
    });
}