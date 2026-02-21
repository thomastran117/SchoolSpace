/**
 * @file container.main.ts
 * @description
 * Creates the blueprint needed to create object, and creates objects when requested.
 *
 * @module container
 * @version 1.0.0
 * @auth Thomas
 */
import { registerControllerModules } from "@container/container.controllers";
import { CoreInitializer } from "@container/container.core";
import { registerQueueModules } from "@container/container.queue";
import { registerRepositoryModules } from "@container/container.repository";
import { registerServiceModules } from "@container/container.services";
import type { Registration } from "@container/container.types";
import logger from "@utility/logger";

class Container {
  private static _instance: Container;
  private readonly services = new Map<string, Registration<any>>();
  private readonly coreInitializer = new CoreInitializer();
  private initialized = false;

  protected constructor() {
    for (const [k, v] of registerRepositoryModules()) this.services.set(k, v);
    for (const [k, v] of registerServiceModules()) this.services.set(k, v);
    for (const [k, v] of registerControllerModules()) this.services.set(k, v);
    for (const [k, v] of registerQueueModules()) this.services.set(k, v);
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
            `Cannot resolve scoped service '${key}' directly from root container.`
          );

        default:
          throw new Error(`Unknown lifetime: ${(reg as any).lifetime}`);
      }
    } catch (err: any) {
      logger.error(
        `[Container] Failed to create mandatory service '${key}': ${err?.message ?? err}`
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
        `[Container] Optional service '${key}' failed to resolve: ${err instanceof Error ? err.message : err}`
      );
      return undefined;
    }
  }

  public createScope(): ScopedContainer {
    try {
      return new ScopedContainer(this);
    } catch (err: any) {
      logger.error(
        `[Container] Creating ScopedContainer failed: ${err?.message ?? err}`
      );
      throw new Error(`Creating Scoped Container failed`);
    }
  }

  private detectCircularDependencies(): void {
    const state = new Map<string, 0 | 1 | 2>();

    const visit = (key: string, path: string[]): void => {
      const current = state.get(key) ?? 0;

      if (current === 1) {
        const cycle = [...path, key].join(" → ");
        throw new Error(`Circular dependency detected: ${cycle}`);
      }

      if (current === 2) return;

      state.set(key, 1);

      const reg = this.services.get(key);
      if (reg?.deps) {
        for (const dep of reg.deps) {
          if (!this.services.has(dep)) {
            throw new Error(
              `Service '${key}' depends on unregistered service '${dep}'`
            );
          }
          visit(dep, [...path, key]);
        }
      }

      state.set(key, 2);
    };

    for (const key of this.services.keys()) {
      if ((state.get(key) ?? 0) === 0) visit(key, []);
    }
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    this.detectCircularDependencies();
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
            `[Container] Failed to initialize required Singleton '${key}': ${err?.message ?? err}`
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
        `[Container] Resolving CacheService failed: ${err?.message ?? err}`
      );
      throw new Error(`Resolving CacheService failed`);
    }
  }

  get fileService() {
    try {
      return this.resolve("FileService");
    } catch (err: any) {
      logger.error(
        `[Container] Resolving FileService failed: ${err?.message ?? err}`
      );
      throw new Error(`Resolving FileService failed`);
    }
  }

  get basicTokenService() {
    try {
      return this.resolve("BasicTokenService");
    } catch (err: any) {
      logger.error(
        `[Container] Resolving BasicTokenService failed: ${err?.message ?? err}`
      );
      throw new Error(`Resolving BasicTokenService failed`);
    }
  }

  printDiagnostics(): void {
    try {
      logger.info("Container Diagnostics:");
      for (const [key, reg] of this.services.entries()) {
        const status = reg.instance ? "✔ instantiated" : "⏳ pending";
        logger.info(
          `  • ${key.padEnd(20)} | Lifetime: ${reg.lifetime.padEnd(10)} | ${status}`
        );
      }
    } catch (err: any) {
      logger.error(
        `[Container] Printing diagnostics failed: ${err?.message ?? err}`
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
              `Singleton '${key}' was not initialized correctly.`
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
        `[Container] Resolving dependencies failed: ${err?.message ?? err}`
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
        `[Container] Optional service '${key}' failed to resolve: ${err instanceof Error ? err.message : err}`
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
        `[Container] Disposing dependencies failed: ${err?.message ?? err}`
      );
      throw new Error(`Service failed to disposed`);
    }
  }
}

export { Container, ScopedContainer };
