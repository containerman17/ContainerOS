const fastify = require('fastify')({ logger: true })
const storeLocator = require('./storeLocator')
const storeProxy = require('./storeProxy')

fastify.get('/', async (request, reply) => {
    return { 'app': `KrakenKV-gate` }
})

fastify.post('/kv/', async (request, reply) => {
    const result = await storeProxy.set(request.body.key, request.body.value)
    return reply.code(result.success ? 200 : 500).send(result)
})

fastify.get('/kv/*', async (request, reply) => {
    return await storeProxy.get(request.params['*'])
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