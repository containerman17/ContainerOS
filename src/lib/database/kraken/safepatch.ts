import delay from "delay"
import krakenKV from "./krakenKV"


export default async function safePatch(key: string, patch: (oldValue: any) => any, defaultStringValue = '{}',): Promise<void> {
    for (let i = 0; i < 1000; i++) {
        try {
            const beforeModification = await krakenKV.get(key, { ts: true })


            const value = JSON.stringify(
                await patch(
                    JSON.parse(beforeModification.value || defaultStringValue)
                ), null, 2
            )

            await krakenKV.set(key, value, beforeModification.ts)
            return
        } catch (e) {
            await delay(Math.round(Math.random() * 10) + i * 10) // i*10 + 5 on avg
        }
    }
    throw 'Could not patch in 1000 iterations';
}