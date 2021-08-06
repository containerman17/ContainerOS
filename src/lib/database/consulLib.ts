import consul from "./private/consul"
import Consul from "consul"

type LeaderChangedCallback = (leadername: string, isMe: boolean) => void


class ConsulStore {
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

    public async deregisterService(id) {
        // @ts-ignore
        await consul.agent.service.deregister(id)
    }

    public async registerService(service: {
        id: string,
        name: string,
        port: number,
        tags: string[],
    }) {
        // @ts-ignore
        await consul.agent.service.register({
            id: service.id,
            name: service.name,
            port: service.port,
            tags: service.tags,

            check: {
                tcp: `host.docker.internal:${service.port}`,
                interval: '3s',//TODO: change to 15 seconds
                timeout: "3s"
            }
        })
    }
}

export default new ConsulStore