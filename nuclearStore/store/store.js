const fastify = require('fastify')({ logger: true })
const data = require('./data')

fastify.get('/', async (request, reply) => {
    return { hello: 'store' }
})
fastify.post('/replication/set', async (request, reply) => {
    const { key, value, ts } = request.body
    console.log('Got set request', { key, value, ts })
    return await data.set(key, value, ts)
})
fastify.get('/replication/get/*', async (request, reply) => {
    const key = request.params['*']
    return await data.get(key)
})

fastify.get('/healthz', async (request, reply) => {
    return { app: 'nuclear-store', alive: true }
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