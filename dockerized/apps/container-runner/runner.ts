import syncContainersList from "./syncContainersList"
import getDefaultContainers from './getDefaultContainers'

async function start(): Promise<void> {
    console.log('Runner is running')
    try {
        const defaultContainers = await getDefaultContainers();
        console.log('defaultContainers', defaultContainers)
        const result = await syncContainersList(defaultContainers)
        console.log('result', result)
    } catch (e) {
        console.error(e)
    }
}

export default { start }
