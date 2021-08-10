import { StoredIngress } from "../../types"
import AbstractObject from "./private/AbstractObject"

class Microservice extends AbstractObject<StoredIngress> {
    constructor() {
        super('ingress')
    }
}

export default new Microservice()