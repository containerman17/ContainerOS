import consul from "./consulInstance"
import Consul from "consul";
import delay from "delay"
import { keyable } from "../../definitions"


export default async function safePatch(key: string, patch: (oldValue: any) => any, defaultStringValue = '{}',): Promise<void> {
    for (let i = 0; i < 1000; i++) {
        try {
            const beforeModification = await consul.kv.get<Consul.Kv.GetOneResponse>(key) || {
                Value: defaultStringValue,
                ModifyIndex: undefined
            }

            const value = JSON.stringify(
                patch(
                    JSON.parse(beforeModification.Value)
                ), null, 2
            )

            const setParam: Consul.Kv.SetOptions = { key, value }

            if (typeof beforeModification.ModifyIndex !== "undefined") {
                setParam.cas = String(beforeModification.ModifyIndex)
            }

            const setResult = await consul.kv.set(setParam)
            if (setResult === true) {
                return
            }
            await delay(Math.round(Math.random() * 500)) // 250 ms on average
        } catch (e) {
            if (e?.statusCode === 429) {
                await delay(Math.round(Math.random() * 1000)) // 500 ms on average
            } else {
                throw e
            }
        }
    }
    throw 'Could not patch in 1000 iterations';
}