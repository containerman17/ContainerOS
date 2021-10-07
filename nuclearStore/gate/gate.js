const fastify = require('fastify')({ logger: true })
const storeLocator = require('./storeLocator')
const storeProxy = require('./storeProxy')

fastify.get('/', async (request, reply) => {
    return { hello: 'gate' }
})

fastify.get('/test/set', async (request, reply) => {
    const result = await storeProxy.set('test-key', 'test-value')
    return reply.code(result.success ? 200 : 500).send(result)
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