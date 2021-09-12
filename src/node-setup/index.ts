import config from "../config"
import execa from "execa"
import logger from "../lib/logger"

let setupComplete = false
async function setup() {
    if (setupComplete) return
    await execa('docker', [
        'login',
        config.API_HOST,
        '-u', 'root',
        '-p', config.ROOT_TOKEN,
    ])
    console.log(`Node set up complete`)
    setupComplete = true
}

async function start() {
    for (let i = 0; i < 5; i++) {
        try {
            await setup()
            logger.info(`Set up complete`)
            break
        } catch (e) {
            logger.debug(e)
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    }

    await setup()

    setInterval(() => console.log(`Keeping this container alive`), 60 * 60 * 1000)
}

start().catch(e => {
    console.error(e)
    process.exit(1)
})
