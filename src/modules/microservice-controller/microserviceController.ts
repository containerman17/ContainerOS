import database from "../../lib/database"


// async function start() {
//     let started = false

//     database.onLeaderChanged((newLeader) => {
//         if (newLeader === myIp) {
//             console.error("Cool! I am a leader. Starting listeners")
//             if (started) {
//                 return
//             } else {
//                 started = true
//                 actuallyStart()
//             }
//         } else if (started) {
//             console.error("I am not a conslu leader anymore :/")
//             process.exit(1)
//         } else {
//             console.log("I am a follower. Not listening for updates")
//         }
//     })
// }