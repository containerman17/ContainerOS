// import runner from './modules/container-runner-old/runner';
// import clusterAPI from './modules/cluster-api/api';
// import nodeAPI from './modules/node-api/api';
// import listeners from './modules/change-listeners/listeners';
// import reporter from './modules/health-reporter/reporter';
// import registrator from './modules/consul-registrator/index';
// import configurator from './modules/caddy-configurator/configurator';
// import deployments from './modules/system-deployments/deployments';

async function start() {
    process.on('unhandledRejection', (reason, p) => {
        console.error('Unhandled Rejection at:', p, 'reason:', reason)
        process.exit(1)
    });

    // await runner.start();

    // clusterAPI.start();
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
