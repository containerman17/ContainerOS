import Consul from "consul";
import config from "../../../config"

export default new Consul({
    promisify: true,
    host: config.CONSUL_HOST
})