import database from "../../lib/database"
import getDefaultDeployments from "./getDefaultDeployments"

async function start() {
    console.log('system deployments starting')
    const deployments = await getDefaultDeployments()
    for (let deployment of deployments) {
        await database.updateDeployment(deployment)
    }
}

export default { start }

if (require.main === module) {
    process.on('unhandledRejection',
        (reason, p) => {
            console.error('Unhandled Rejection at:', p, 'reason:', reason)
            process.exit(1)
        });
    start();
}
