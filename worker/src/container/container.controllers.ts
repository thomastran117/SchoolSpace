import type { Registration } from "./container.types";

import logger from "../utility/logger";

function registerControllerModules(): Map<string, Registration<any>> {
  try {
    const controllers = new Map<string, Registration<any>>();

    return controllers;
  } catch (err: any) {
    logger.error(
      `[Container] Controllers registration failed: ${err?.message ?? err}`,
    );
    process.exit(1);
  }
}

export { registerControllerModules };
