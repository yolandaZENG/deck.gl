import { MVTWorker } from './mvt-worker';

const mvtWorkerInstance = new MVTWorker();

export default self => {
  self.onmessage = ev => {
    mvtWorkerInstance.onMessage(ev, self)
  };
}