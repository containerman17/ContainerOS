import { NodeHealth } from "../../types";
import AbstractObject from "./private/AbstractObject";


class NodeHealthController extends AbstractObject<NodeHealth> {
    constructor() {
        super('nodeHealth')
    }
}

export default new NodeHealthController()