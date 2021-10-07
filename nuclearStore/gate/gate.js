const fastify = require('fastify')({ logger: true })
const storeLocator = require('./storeLocator')
const syncedData = require('./syncedData')

fastify.get('/', async (request, reply) => {
    return { 'app': `KrakenKV-gate` }
})

fastify.get('/test/burstHostChecks', async (request, reply) => {
    storeLocator.burstHostChecks()
    return { success: true }
})
fastify.get('/test/forceResync', async (request, reply) => {
    storeLocator.forceResync()
    return { success: true }
})

fastify.post('/kv/', async (request, reply) => {
    const result = await syncedData.set(request.body.key, request.body.value)
    return reply.code(result.success ? 200 : 500).send(result)
})

fastify.get('/kv/*', async (request, reply) => {
    return await syncedData.get(request.params['*'])
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