import syncContainersList from "./syncContainersList"

async function start(): Promise<void> {
    console.log('Runner is running')
    const result = await syncContainersList([
        {
            name: 'test1',
            Image: 'nginx:1.21-perl'
        },
        {
            name: 'test2',
            Image: 'nginx:1.17-perl'
        },
        {
            name: 'test3',
            Image: 'nginx:alpine-perl'
        },
    ])
    console.log('result', result)
}



export default { start }
