import axios from "axios"

const SERVER = 'http://localhost:8080'

const start = async function () {
    try {
        const response = await axios.post(SERVER + '/v1/app/testns/testapp', {
            image: "tutum/hello-world"
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