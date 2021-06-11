import database from "../../lib/database"
import onDeploymentListChanged from "./onDeploymentListChanged"

async function start(): Promise<void> {
    database.listenForUpdates("deployments", onDeploymentListChanged)
}

export default { start }

if (require.main === module) {
    start();
}
