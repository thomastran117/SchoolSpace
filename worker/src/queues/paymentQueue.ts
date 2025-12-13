import { Queue } from "bullmq";
import { connectionWorker } from "../resource/redis";

export const paymentQueue = new Queue("payment", {
  connection: connectionWorker,
});
