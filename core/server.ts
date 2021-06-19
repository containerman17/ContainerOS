import scheduler from './modules/scheduler/scheduler';
import api from './modules/control-api/api';
import listeners from './modules/change-listeners/listeners';
import reporter from './modules/health-reporter/reporter';
import registrator from './modules/consul-registrator/index';

async function start() {
    await scheduler.init();

    api.start();
    scheduler.start();
    reporter.start();
    listeners.start()
    registrator.start()
}



if (require.main === module) {
    start();
}
