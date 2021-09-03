import config from "../config"
import execa from "execa"

async function start() {
    await execa('docker', [
        'login',
        config.API_HOST,
        '-u', 'root',
        '-p', config.ROOT_TOKEN,
    ])
    console.log(`Node set up complete`)
}

start().catch(e => {
    console.error(e)
    process.exit(1)
})
