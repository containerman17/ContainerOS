import syncContainersList from "./syncContainersList"
import getDefaultContainers from './getDefaultContainers'

async function start(): Promise<void> {
    console.log('Runner is running')
    try {
        const defaultContainers = await getDefaultContainers();
        const result = await syncContainersList(defaultContainers)
    } catch (e) {
        console.error(e)
    }
}

export default { start }

if (require.main === module) {
    start();
}
