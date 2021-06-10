import Consul from "consul"

const consul = new Consul({
    promisify: true,
    host: process.env.CONSUL_HOST || '127.0.0.1'
})

export default consul