import scheduler from './modules/scheduler/scheduler';
import api from './modules/control-api/api';
import listeners from './modules/change-listeners/listeners';
import reporter from './modules/health-reporter/reporter';

process.on('unhandledRejection', (error: Error) => {
    console.log('unhandledRejection', error);
    process.exit(1)
});

async function start() {
    await scheduler.init();

    api.start();
    scheduler.start();
    reporter.start();
    listeners.start()
}



if (require.main === module) {
    start();
}
