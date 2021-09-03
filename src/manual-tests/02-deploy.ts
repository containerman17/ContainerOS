import axios from "axios"
import { getMyExternalIP } from "../lib/utils"
const SERVER = 'http://localhost:8080'

const start = async function () {
    try {
        const ip = await getMyExternalIP()

        let response

        response = await axios.post(SERVER + '/v1/app/testns/testapp', {
            image: "tutum/hello-world",
            internetPort: 80,
            internetDomain: `testservice.${ip}.nip.io`,
        }, {
            auth: {
                username: 'root',
                password: 'dev'
            }
        })
        console.log('Successs')
        console.log(response.data)

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