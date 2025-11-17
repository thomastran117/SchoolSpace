import logger from "../utility/logger";
import { connectionWorker } from "./redis";

const HEALTH_KEY = "worker:payment:health";
const HEARTBEAT_TTL_MS = 30_000;

export async function markWorkerAlive(): Promise<void> {
  try {
    const now = Date.now();
    await connectionWorker.set(
      HEALTH_KEY,
      JSON.stringify({ alive: true, lastHeartbeat: now }),
      "PX",
      HEARTBEAT_TTL_MS * 2,
    );
  } catch (err: any) {
    logger.error(`[WorkerHealth] Failed to update heartbeat: ${err.message}`);
  }
}

export async function markWorkerDead(): Promise<void> {
  try {
    await connectionWorker.set(
      HEALTH_KEY,
      JSON.stringify({ alive: false, lastHeartbeat: Date.now() }),
      "PX",
      HEARTBEAT_TTL_MS * 2,
    );
  } catch (err: any) {
    logger.error(`[WorkerHealth] Failed to mark worker dead: ${err.message}`);
  }
}

export async function isWorkerHealthy(): Promise<boolean> {
  try {
    const value = await connectionWorker.get(HEALTH_KEY);
    if (!value) return false;

    const { alive, lastHeartbeat } = JSON.parse(value);
    const now = Date.now();

    if (alive && now - lastHeartbeat < HEARTBEAT_TTL_MS) {
      return true;
    }

    return false;
  } catch (err: any) {
    logger.error(`[WorkerHealth] Failed to check health: ${err.message}`);
    return false;
  }
}

export async function getWorkerStatus() {
  const value = await connectionWorker.get(HEALTH_KEY);
  if (!value) {
    return { alive: false, lastHeartbeat: null };
  }
  return JSON.parse(value);
}
