import consul from "./private/consul"

type LeaderChangedCallback = (leadername: string, isMe: boolean) => void

class SystemCtrl {
    private leaderChangedCallbacks: LeaderChangedCallback[] = []
    private started = false

    public onLeaderChanged(cb: LeaderChangedCallback) {
        this.leaderChangedCallbacks.push(cb)

        if (!this.started) {
            this.started = true
            setTimeout(() => this.checkForLeader(), 60 * 1000)//TODO: such a dirty hack :/
        }

        this.checkForLeader() // recheck for a fresh subscriber
    }

    private async checkForLeader() {
        const self = await consul.agent.self()

        // @ts-ignore
        const isLeader: boolean = self.Stats.consul.leader === 'true'
        // @ts-ignore
        const newLeader = self.Stats.consul.leader_addr.split(':')[0]


        this.leaderChangedCallbacks.map(cb => cb(newLeader, isLeader))
    }
}

export default new SystemCtrl