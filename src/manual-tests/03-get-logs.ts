import axios from "axios"
import fs from 'fs'
const SERVER = fs.readFileSync(__dirname + '/host.txt')

const start = async function () {
    try {
        let response

        response = await axios.get(SERVER + '/v1/app/testns/testapp/logs', {
            auth: {
                username: 'root',
                password: 'dev'
            }
        })
        console.log('Successs')
        console.log(response.data)
    } catch (e) {
        console.error('Fail')
        console.error(String(e).slice(0, 100))
        console.error(e.response.data)
    }
}
start()