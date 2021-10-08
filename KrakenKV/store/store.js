const fastify = require('fastify')({
    logger: {
        prettyPrint: true
    }
})
const data = require('./data')

fastify.get('/', async (request, reply) => {
    return { app: 'KrakenKV-store', alive: true }
})

fastify.post('/sync/bulk', async (request, reply) => {
    for (let [key, val] of Object.entries(request.body)) {
        data.set(key, val.value, val.ts)
    }

    return { success: true }
})

fastify.get('/sync/bulk', async (request, reply) => {
    return await data.getAll()
})

fastify.get('/test/reset', async (request, reply) => {
    return data.reset()
})

fastify.get('/healthz', async (request, reply) => {
    return { app: 'KrakenKV-store', alive: true }
})

// Run the server!
const start = async () => {
    try {
        await fastify.listen(3000, '0.0.0.0')
    } catch (err) {
        fastify.log.error(err)
        process.exit(1)
    }
}
start()