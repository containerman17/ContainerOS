import { StoredRoute } from "../../types"
import AbstractObject from "./private/AbstractObject"

class RouteControler extends AbstractObject<StoredRoute> {
    constructor() {
        super('routes')
    }
}

export default new RouteControler()