// import runner from './modules/container-runner-old/runner';
// import nodeAPI from './modules/node-api/api';
// import listeners from './modules/change-listeners/listeners';
// import reporter from './modules/health-reporter/reporter';
// import registrator from './modules/consul-registrator/index';
// import configurator from './modules/caddy-configurator/configurator';
// import deployments from './modules/system-deployments/deployments';

import setUpNode from "./modules/set-up-node/setUpNode"
import clusterAPI from './modules/cluster-api/api';
import startReporting from './modules/node-health-reporter/startReporting';

async function start() {
    process.on('unhandledRejection', (reason, p) => {
        console.error('Unhandled Rejection at:', p, 'reason:', reason)
        process.exit(1)
    });

    await setUpNode()//has to be executed first

    startReporting();
    clusterAPI.start();


    // nodeAPI.start();
    // reporter.start();
    // listeners.start()
    // registrator.start()
    // configurator.start()
    // deployments.start()
}



if (require.main === module) {
    start();
}
