import consul from "./consul"
import { keyable } from "../../../types"
import { truncate } from "fs";

const watches = {}
const lastStates: keyable<any> = {}

export default function (key: string, callback: (result: keyable<any>) => void, stripPath = true) {
    if (!watches[key]) {
        watches[key] = consul.watch({
            method: consul.kv.get,
            // @ts-ignore
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
        const result: keyable<any> = {}
        if (data !== undefined) {
            for (let { Key, Value } of data || []) {
                const strippedKey = stripPath
                    ? Key.slice(key.length + 1)[0]
                    : Key
                result[strippedKey] = JSON.parse(Value)
            }
        }
        lastStates[key] = result//dirty hack for delayed listeners
        callback(result)
    });
}