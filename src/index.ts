// import runner from './modules/container-runner-old/runner';
// import nodeAPI from './modules/node-api/api';
// import listeners from './modules/change-listeners/listeners';
// import reporter from './modules/health-reporter/reporter';
// import registrator from './modules/consul-registrator/index';
// import configurator from './modules/caddy-configurator/configurator';
// import deployments from './modules/system-deployments/deployments';
import logger from "./lib/logger"
import setUpNode from "./core/set-up-node/setUpNode"
import clusterAPI from './plugins/cluster-api/api';
import startReporting from './core/node-health-reporter/startReporting';

async function start() {
    process.on('unhandledRejection', (reason, p) => {
        logger.error('Unhandled Rejection at:', p, 'reason:', reason)
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
