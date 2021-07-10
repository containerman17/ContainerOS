let userNumber = 0


module.exports = {
    getNextProject() {
        const name = 'testproject' + (userNumber++)
        return { name, token: name + 'token' }
    },
    getCreatedProjects() {
        return Array.from(Array(10).keys())
            .map(i => ({ name: 'testproject' + i, token: 'testproject' + i + 'token' }))
    }
}