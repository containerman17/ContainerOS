import axios from "axios"
import { sha256 } from "../lib/utils"
const SERVER = 'http://localhost:8080'

const start = async function () {
    try {
        console.log(`Set token...`)
        let response

        response = await axios.post(SERVER + '/v1/users/testovyivan@gmail.com/token', {
            tokenHash: sha256('123')
        })
        console.log('Successs')
        console.log(response.data)

        console.log(`Add to team...`)

        response = await axios.post(SERVER + '/v1/users/testovyivan@gmail.com/teams/add', {
            team: 'testns'
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