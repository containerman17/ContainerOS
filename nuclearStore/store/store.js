const fastify = require('fastify')({ logger: true })

fastify.get('/', async (request, reply) => {
    return { hello: 'store' }
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