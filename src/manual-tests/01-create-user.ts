import axios from "axios"
import { sha256 } from "../lib/utils"
import fs from 'fs'
const SERVER = fs.readFileSync(__dirname + '/host.txt')

const start = async function () {
    try {
        console.log(`Set token...`)
        let response

        response = await axios.post(SERVER + '/v1/users/test@gmail.com/token', {
            tokenHash: sha256('123')
        }, {
            auth: {
                username: 'root',
                password: 'dev'
            }
        })
        console.log('Successs')
        console.log(response.data)

        console.log(`Add to team...`)

        response = await axios.post(SERVER + '/v1/users/test@gmail.com/teams/add', {
            team: 'testns'
        }, {
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