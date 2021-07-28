import { MicroserviceUpdate, StoredPod, keyable } from "../../types"
import safePatch from "./private/safePatch"
import AbstractObject from "./private/AbstractObject"

class PodController extends AbstractObject<StoredPod> {
    constructor() {
        super('pods')
    }
}

export default new PodController()