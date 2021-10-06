const fastify = require('fastify')({ logger: true })
const storeLocator = require('./storeLocator')

fastify.get('/', async (request, reply) => {
    return { hello: 'gate' }
})

const start = async () => {
    try {
        await storeLocator.start()
        await fastify.listen(3000, '0.0.0.0')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()