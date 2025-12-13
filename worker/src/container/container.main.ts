import logger from "../utility/logger";
import { registerControllerModules } from "./container.controllers";
import { CoreInitializer } from "./container.core";
import { registerRepositoryModules } from "./container.repository";
import { registerServiceModules } from "./container.services";
import type { Registration } from "./container.types";

class Container {
  private static _instance: Container;
  private readonly services = new Map<string, Registration<any>>();
  private readonly coreInitializer = new CoreInitializer();
  private initialized = false;

  protected constructor() {
    for (const [k, v] of registerRepositoryModules()) this.services.set(k, v);
    for (const [k, v] of registerServiceModules()) this.services.set(k, v);
    for (const [k, v] of registerControllerModules()) this.services.set(k, v);
  }

  static get instance(): Container {
    if (!this._instance) this._instance = new Container();
    return this._instance;
  }

  public resolve<T>(key: string): T {
    const reg = this.services.get(key);
    if (!reg) {
      logger.error(`[Container] Missing mandatory service: ${key}`);
      throw new Error(`Service not registered: ${key}`);
    }

    try {
      switch (reg.lifetime) {
        case "singleton":
          if (!reg.instance) reg.instance = reg.factory() as T;
          return reg.instance;

        case "transient":
          return reg.factory() as T;

        case "scoped":
          throw new Error(
            `Cannot resolve scoped service '${key}' directly from root container.`,
          );

        default:
          throw new Error(`Unknown lifetime: ${(reg as any).lifetime}`);
      }
    } catch (err: any) {
      logger.error(
        `[Container] Failed to create mandatory service '${key}': ${err?.message ?? err}`,
      );
      throw new Error(`Service failed to resolve: ${key}`);
    }
  }

  public resolveOptional<T>(key: string): T | undefined {
    const reg = this.services.get(key);

    if (!reg) {
      logger.warn(`[Container] Optional service '${key}' not registered.`);
      return undefined;
    }

    try {
      return this.resolve<T>(key);
    } catch (err) {
      logger.warn(
        `[Container] Optional service '${key}' failed to resolve: ${err instanceof Error ? err.message : err}`,
      );
      return undefined;
    }
  }

  public createScope(): ScopedContainer {
    try {
      return new ScopedContainer(this);
    } catch (err: any) {
      logger.error(
        `[Container] Creating ScopedContainer failed: ${err?.message ?? err}`,
      );
      throw new Error(`Creating Scoped Container failed`);
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    await this.coreInitializer.initialize();

    for (const [key, reg] of this.services) {
      if (reg.lifetime === "singleton") {
        try {
          const instance = reg.factory();
          reg.instance =
            instance instanceof Promise ? await instance : instance;

          if (typeof reg.instance.init === "function") {
            await reg.instance.init();
          }
        } catch (err: any) {
          logger.error(
            `[Container] Failed to initialize required Singleton '${key}': ${err?.message ?? err}`,
          );
          throw new Error(`Failed to initialize required singleton: ${key}`);
        }
      }
    }

    logger.info("Container initialized successfully.");
  }

  get cacheService() {
    try {
      return this.resolve("CacheService");
    } catch (err: any) {
      logger.error(
        `[Container] Resolving CacheService failed: ${err?.message ?? err}`,
      );
      throw new Error(`Resolving CacheService failed`);
    }
  }

  printDiagnostics(): void {
    try {
      logger.info("Container Diagnostics:");
      for (const [key, reg] of this.services.entries()) {
        const status = reg.instance ? "✔ instantiated" : "⏳ pending";
        logger.info(
          `  • ${key.padEnd(20)} | Lifetime: ${reg.lifetime.padEnd(10)} | ${status}`,
        );
      }
    } catch (err: any) {
      logger.error(
        `[Container] Printing diagnostics failed: ${err?.message ?? err}`,
      );
      return;
    }
  }
}

class ScopedContainer {
  private readonly scopeInstances = new Map<string, any>();

  constructor(private readonly root: Container) {}

  resolve<T>(key: string): T {
    try {
      const reg = (this.root as any).services.get(key) as Registration<T>;
      if (!reg) throw new Error(`Service not registered: ${key}`);

      switch (reg.lifetime) {
        case "singleton":
          if (!reg.instance) {
            throw new Error(
              `Singleton '${key}' was not initialized correctly.`,
            );
          }
          return reg.instance;
        case "scoped":
          if (!this.scopeInstances.has(key)) {
            const instance = reg.factory(this) as T;
            this.scopeInstances.set(key, instance);
          }
          return this.scopeInstances.get(key);
        case "transient":
          return reg.factory(this) as T;
      }
    } catch (err: any) {
      logger.error(
        `[Container] Resolving dependencies failed: ${err?.message ?? err}`,
      );
      throw new Error(`Service failed to resolved: ${key}`);
    }
  }

  public resolveOptional<T>(key: string): T | undefined {
    const reg = (this.root as any).services.get(key) as Registration<T>;

    if (!reg) {
      logger.warn(`[Container] Optional service '${key}' not registered.`);
      return undefined;
    }

    try {
      return this.resolve<T>(key);
    } catch (err) {
      logger.warn(
        `[Container] Optional service '${key}' failed to resolve: ${err instanceof Error ? err.message : err}`,
      );
      return undefined;
    }
  }

  dispose(): void {
    try {
      for (const [key, instance] of this.scopeInstances.entries()) {
        if (typeof instance.dispose === "function") instance.dispose();
        this.scopeInstances.delete(key);
      }
    } catch (err: any) {
      logger.error(
        `[Container] Disposing dependencies failed: ${err?.message ?? err}`,
      );
      throw new Error(`Service failed to disposed`);
    }
  }
}

export { Container, ScopedContainer };
