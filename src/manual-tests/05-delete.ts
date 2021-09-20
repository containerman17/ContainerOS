import axios from "axios"
import { getMyExternalIP } from "../lib/utils"
import fs from 'fs'
const SERVER = fs.readFileSync(__dirname + '/host.txt').toString().trim()

const start = async function () {
    try {
        const ip = await getMyExternalIP()

        let response

        response = await axios.post(SERVER + '/v1/app/testns/testapp/delete', {}, {
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