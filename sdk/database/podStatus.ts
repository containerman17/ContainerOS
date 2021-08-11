import { StoredPodStatus, keyable, StoredPodStatusElement } from "../types"
import AbstractObject from "./private/AbstractObject"

export class PodStatusStore extends AbstractObject<StoredPodStatus> {
    constructor() {
        super('podStatus')
    }
    public async report(name: string, statusElement: StoredPodStatusElement) {
        const defaultValue: StoredPodStatus = { history: [] }

        return await super.safePatch(name, (oldValue: StoredPodStatus): StoredPodStatus => {
            return {
                history: [
                    { ts: Number(new Date), ...statusElement },
                    ...oldValue.history
                ]
            }
        }, JSON.stringify(defaultValue))
    }
    public async update(name: string, data: StoredPodStatus) {
        throw Error("Update is not expected on podStatus object")
    }
    public async safePatch(name: string, patch: (oldValue: StoredPodStatus) => StoredPodStatus) {
        throw Error("Update is not expected on podStatus object")
    }
}

export default new PodStatusStore()