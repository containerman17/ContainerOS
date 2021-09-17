import axios from "axios"
import execa from "execa"
import assert from "assert"
import fs from 'fs'
const SERVER = fs.readFileSync(__dirname + '/host.txt')

async function isPushSuccessful(img: string) {
    try {
        await execa("docker", `push ${img}`.split(' '))
        console.log('Pushing ' + img + ' successful')
        return true
    } catch (e) {
        console.log('Pushing ' + img + ' failed')

        return false
    }
}

const start = async function () {
    try {
        //expect create user to be called
        await execa("docker", "login localhost:8080 -u test@gmail.com -p 123".split(' '))
        // execa("docker", "pull alpine".split(' '))
        await execa("docker", `tag alpine localhost:8080/testns/myimage`.split(' '))
        await execa("docker", `tag alpine localhost:8080/notmyns/myimage`.split(' '))
        await execa("docker", `tag alpine localhost:8080/nons`.split(' '))
        assert(false === await isPushSuccessful('localhost:8080/notmyns/myimage'))
        assert(false === await isPushSuccessful('localhost:8080/nons'))
        assert(true === await isPushSuccessful('localhost:8080/testns/myimage'))

        console.log('Passed')
    } catch (e) {
        console.error('Fail')
        console.error(String(e).slice(0, 300))
    }
}
start()