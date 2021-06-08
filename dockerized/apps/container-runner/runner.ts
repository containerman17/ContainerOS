import syncContainersList from "./syncContainersList"

function start(): void {
    console.log('Runner is running')
    syncContainersList([
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
}



export default { start }
