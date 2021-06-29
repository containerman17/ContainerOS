import database from "../../lib/database"
import reportNodeHealth from "./reportNodeHealth"
import onContainerStatusChanged from "./onContainerStatusChanged"
import { NODE_HEALTH_INTERVAL } from "../../config"
import { StoredContainerStatus } from "../../definitions"


async function start(): Promise<void> {
    setInterval(reportNodeHealth, NODE_HEALTH_INTERVAL)
    onContainerStatusChanged(function (containerStatus: StoredContainerStatus) {
        database.setWithDelay(`podHealth/${containerStatus.podName}/${containerStatus.containerName}`, containerStatus)
    })
}

export default { start }

if (require.main === module) {
    start();
}
