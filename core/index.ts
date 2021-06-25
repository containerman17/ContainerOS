import scheduler from './modules/scheduler-compose/scheduler';
import api from './modules/control-api/api';
import listeners from './modules/change-listeners/listeners';
import reporter from './modules/health-reporter/reporter';
import registrator from './modules/consul-registrator/index';
import configurator from './modules/caddy-configurator/configurator';

async function start() {
    process.on('unhandledRejection', (reason, p) => {
        console.error('Unhandled Rejection at:', p, 'reason:', reason)
        process.exit(1)
    });

    await scheduler.start();

    api.start();
    reporter.start();
    listeners.start()
    registrator.start()
    configurator.start()
}



if (require.main === module) {
    start();
}
