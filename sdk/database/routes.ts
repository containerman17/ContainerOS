import { StoredRoute } from "../types"
import AbstractObject from "./private/AbstractObject"

export class RouteControler extends AbstractObject<StoredRoute> {
    constructor() {
        super('routes')
    }
}

export default new RouteControler()