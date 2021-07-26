import { NodeHealth } from "../../types";
import AbstractObject from "./private/AbstractObject";


class NodeHealthController extends AbstractObject<NodeHealth> {
    constructor() {
        super('nodeHealth')
    }
    public getLeastBusyServerName() {

    }
}

export default new NodeHealthController()