// import consul from "./private/consul"

// type LeaderChangedCallback = (leadername: string) => void
// const leaderChangedCallbacks: LeaderChangedCallback[] = []

// setTimeout(checkForLeader, 60 * 1000)//TODO: such a dirty hack :/

// let lastLeader: string = null
// async function checkForLeader() {
//     const response: string = await consul.status.leader()
//     const newLeader = response.split(':')[0]
//     if (lastLeader !== newLeader) {
//         leaderChangedCallbacks.map(cb => cb(newLeader))
//     }
//     lastLeader = newLeader
// }

// export async function onLeaderChanged(callback: LeaderChangedCallback) {
//     leaderChangedCallbacks.push(callback)
//     await checkForLeader()
// }

// if (require.main === module) {
//     onLeaderChanged(console.log);
// }
