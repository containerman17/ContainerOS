import fs from "fs"

export function printCaddyFile() {
    const caddyFile = fs.readFileSync("/etc/caddy/Caddyfile")
    console.log('Caddy file ===>')
    console.log(String(caddyFile))
    console.log('<===')
}