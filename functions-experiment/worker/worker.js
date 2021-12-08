const Redis = require('redis');

(async () => {
    const client = Redis.createClient();

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    await client.set('key', 'value');
    const value = await client.get('key');
    console.log(
        value === 'value' ? 'Redis Client works' : 'Redis Client does not work'
    )
})();