
import reportNodeHealth from "./reportNodeHealth"
import onContainerStatusChanged from "./onContainerStatusChanged"
import { NODE_HEALTH_INTERVAL } from "../../config"

async function start(): Promise<void> {
    setInterval(reportNodeHealth, NODE_HEALTH_INTERVAL)
}

export default { start }

if (require.main === module) {
    start();
}
