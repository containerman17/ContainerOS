import { getUser, updateUser } from "./lib/database"
import { StoredUser } from "./types";
import { sha256 } from "./lib/utils";

async function start() {
    //create root account

    const newPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    await updateUser("root", function (user: StoredUser) {
        user.tokenHash = sha256(newPassword)
        return user
    })
    console.log(`Root token is ` + newPassword)
}

start().catch(e => {
    console.error(e)
    process.exit(1)
}).then(() => process.exit(0))
