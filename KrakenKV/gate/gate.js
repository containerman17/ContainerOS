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
    const result = await syncedData.set(request.body.key, request.body.value, null, request.body.checkTs || null)
    return reply.code(result.success ? 200 : 400).send(result)
})



fastify.get('/kv/*', async (request, reply) => {
    if (request.query.watch) {
        return await syncedData.getWatch(request.params['*'], Number(request.query.watch))
    } else if (request.query.recurse) {
        return await syncedData.getRecursive(request.params['*'])
    } else {
        return await syncedData.get(request.params['*'])
    }
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