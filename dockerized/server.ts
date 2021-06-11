import runner from './modules/container-runner/runner';
import api from './modules/control-api/api';
import listeners from './modules/change-listeners/listeners';

if (true) { //TODO if is master (=== consul is master)
    listeners.start()
}

runner.start();
api.start();