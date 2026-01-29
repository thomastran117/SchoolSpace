/**
 * @file controllerHook.ts
 * @description
 * Provides the controller + service to the calling route
 *
 * @module hook
 * @version 1.0.0
 * @auth Thomas
 */
import type { FastifyReply, FastifyRequest } from "fastify";

import type { ControllerInstance, ControllerKey } from "../types/controller";

export function useController<K extends ControllerKey>(
  key: K,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  selector: (instance: ControllerInstance<K>) => Function
) {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const controller = req.resolve<ControllerInstance<K>>(key);
    const fn = selector(controller);

    return fn.call(controller, req, reply);
  };
}
