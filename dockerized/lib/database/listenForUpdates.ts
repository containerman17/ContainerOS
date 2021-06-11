import consul from "./consulInstance"
import { keyable } from "../../definitions"

export default function (key: string, callback: (result: keyable<any>) => void) {
    var watch = consul.watch({
        method: consul.kv.get,
        options: { key, recurse: true },
        backoffFactor: 1000,
        maxAttempts: 500
    });

    watch.on('change', function (data, res) {
        const result: keyable<any> = {}
        if (data !== undefined) {
            for (let item of data || []) {
                result[item.Key] = JSON.parse(item.Value)
            }
        }
        callback(result)
    });

    watch.on('error', function (err) {
        console.error('watch error:', err);
        process.exit(1)
    });
}