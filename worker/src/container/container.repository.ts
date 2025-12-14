import type { Registration } from "./container.types";

import logger from "../utility/logger";

function registerRepositoryModules(): Map<string, Registration<any>> {
  try {
    const repositories = new Map<string, Registration<any>>();

    return repositories;
  } catch (err: any) {
    logger.error(
      `[Container] Repositories registration failed: ${err?.message ?? err}`,
    );
    process.exit(1);
  }
}

export { registerRepositoryModules };
