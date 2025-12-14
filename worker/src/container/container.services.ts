import { CacheService } from "../service/cacheService";
import { EmailService } from "../service/emailService";
import { PaymentService } from "../service/paymentService";
import { WebService } from "../service/webService";

import type { Registration } from "./container.types";

import logger from "../utility/logger";

function registerServiceModules(): Map<string, Registration<any>> {
  try {
    const services = new Map<string, Registration<any>>();

    services.set("CacheService", {
      factory: () => new CacheService(),
      lifetime: "singleton",
    });

    services.set("EmailService", {
      factory: () => new EmailService(),
      lifetime: "singleton",
    });

    services.set("WebService", {
      factory: () => new WebService(),
      lifetime: "transient",
    });

    services.set("PaymentService", {
      factory: (scope) => new PaymentService(scope.resolve("WebService")),
      lifetime: "scoped",
    });

    return services;
  } catch (err: any) {
    logger.error(
      `[Container] Services registration failed: ${err?.message ?? err}`,
    );
    process.exit(1);
  }
}

export { registerServiceModules };
