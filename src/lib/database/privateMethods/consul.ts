import Consul from "consul";

export default new Consul({
    promisify: true,
    host: '127.0.0.1'
})