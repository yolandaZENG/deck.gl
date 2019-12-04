import { MVTWorker } from './mvt-worker';

/* global self */

export default self => {
  const mvtWorkerInstance = new MVTWorker();
  self.onmessage = ev => {
    mvtWorkerInstance.processEvent(ev).then(data => {
      self.postMessage(data)
    });
  };
}