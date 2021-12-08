const generate = require('project-name-generator')
const delay = require('delay')

let counter = 0

module.exports = async function (data) {
    ++counter
    await delay(300)
    return generate().dashed + '-' + counter
}