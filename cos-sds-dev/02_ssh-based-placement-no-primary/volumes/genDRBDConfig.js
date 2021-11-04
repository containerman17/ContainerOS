module.exports = function ({
    volName,
    nodes,
    port,
    device,
    disk
}) {
    let config = `
resource ${volName} {
    device    ${device};
    disk      ${disk};
    meta-disk internal;
`
    for (let node of nodes) {
        config += `
    on ${node.name} {
        address     ${node.ip}:${port};
        node-id     ${node.id};
        ${node.diskless ? 'disk        none;' : ''}
    }
`
    }

    config += `
    connection-mesh {
        hosts ${nodes.map(node => node.name).join(' ')};
    }
      
}`
    return config
}
