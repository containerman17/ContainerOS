module.exports = function (attempts, promiseGen) {
    let lastError
    for (let i = 0; i < attempts; i++) {
        try {
            return await promiseGen()
        } catch (e) {
            lastError = e
        }
    }
    throw lastError
}