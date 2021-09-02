import axios from "axios"
import execa from "execa"
import assert from "assert"

async function isPushSuccessful(img: string) {
    try {
        const response = await execa("docker", `push ${img}`.split(' '))
        console.log(response)
        return true
    } catch (e) {
        return false
    }
}

const start = async function () {
    try {
        //expect create user to be called
        execa("docker", "login localhost:8080 -u test@gmail.com -p 123".split(' '))
        // execa("docker", "pull alpine".split(' '))
        execa("docker", `tag alpine localhost:8080/testns/myimage`.split(' '))
        // execa("docker", `tag alpine localhost:8080/notmyns/myimage`.split(' '))
        // execa("docker", `tag alpine localhost:8080/nons`.split(' '))
        // execa("docker", `tag alpine localhost:8080/too/damn/deep`.split(' '))

        assert(true === await isPushSuccessful('localhost:8080/testns/myimage'))
    } catch (e) {
        console.error('Fail')
        console.error(String(e).slice(0, 100))
        console.error(e.response.data)
    }
}
start()