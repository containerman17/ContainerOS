import execa from "execa"
import path from "path"

async function execMake(comand, ignoreErrors = false) {
    try {
        await execa('make', [comand], {
            cwd: path.join(__dirname, '../..')
        });
    } catch (e) {
        if (!ignoreErrors) {
            throw e
        }
    }
}

describe('Router integration test', () => {
    before(() => {
        await execMake('try-to-start-consul', true)
        await execMake('stop-test-container', true)
        await execMake('start-test-container')
    })
    after(() => {
        await execMake('stop-test-container')
    })
    it('Responds')
    it('Responds on known domain request')
    it('Responds 404 on unknown domain request')
})