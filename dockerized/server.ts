import runner from './modules/container-runner/runner';
import api from './modules/control-api/api';
import listeners from './modules/change-listeners/listeners';
import reporter from './modules/health-reporter/reporter';

if (true) { //TODO: if is master (=== consul is master)
    listeners.start()
}

runner.start();
api.start();
reporter.start();

process.on('unhandledRejection', (error: Error) => {
    console.log('unhandledRejection', error);
    process.exit(1)
});