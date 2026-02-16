import type { FastifyInstance } from "fastify";

import { useController } from "../hooks/controllerHook";

async function healthRoutes(app: FastifyInstance) {
  app.get(
    "/",
    useController("HealthController", (c) => c.index)
  );

  app.get(
    "/health",
    useController("HealthController", (c) => c.index)
  );

  app.get(
    "/ping",
    useController("HealthController", (c) => c.ping)
  );

  app.get(
    "/api",
    useController("HealthController", (c) => c.index)
  );

  app.get(
    "/api/health",
    useController("HealthController", (c) => c.index)
  );

  app.get(
    "/api/ping",
    useController("HealthController", (c) => c.ping)
  );
}

export { healthRoutes };
