import { httpError } from "../utility/httpUtility";
import logger from "../utility/logger";

abstract class BaseService {
  protected toSafe(doc: any) {
    try {
      return doc;
    } catch {
      logger.error("[BaseService] Something went wrong converting _id to id");
      httpError(500, "An internal server error occured");
    }
  }

  protected toSafeArray(docs: any[]) {
    try {
      return docs.map((d) => this.toSafe(d));
    } catch {
      logger.error(
        "[BaseService] Something went wrong converting each object's _id to id"
      );
      httpError(500, "An internal server error occured");
    }
  }

  protected ensureDependencies(...deps: string[]) {
    const caller = this.getCallerName();

    for (const depName of deps) {
      const dep = (this as any)[depName];

      if (!dep) {
        logger.error(
          `[${this.constructor.name}] ${caller} failed. Missing dependency: ${depName}`
        );
        httpError(503, `Service is not ready to handle this request`);
      }
    }
  }

  private getCallerName(): string {
    const stack = new Error().stack;
    if (!stack) return "unknown";

    const lines = stack.split("\n");
    const callerLine = lines[3] || lines[2] || "";

    const match = callerLine.trim().match(/at\s+([^\s]+)/);
    return match?.[1] ?? "unknown";
  }
}

export { BaseService };
