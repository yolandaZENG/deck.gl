import { MVTWorker } from './mvt-worker';

const mvtWorkerInstance = new MVTWorker();

onmessage = function (event) {
    return mvtWorkerInstance.onMessage(event);
};
