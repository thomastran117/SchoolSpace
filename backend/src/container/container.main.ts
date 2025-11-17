import logger from "../utility/logger";
import { registerControllerModules } from "./container.controllers";
import { CoreInitializer } from "./container.core";
import { registerServiceModules } from "./container.services";
import type { Registration } from "./container.types";

class Container {
  private static _instance: Container;
  private readonly services = new Map<string, Registration<any>>();
  private readonly coreInitializer = new CoreInitializer();
  private initialized = false;

  protected constructor() {
    for (const [k, v] of registerServiceModules()) this.services.set(k, v);
    for (const [k, v] of registerControllerModules()) this.services.set(k, v);
  }

  static get instance(): Container {
    if (!this._instance) this._instance = new Container();
    return this._instance;
  }

  public resolve<T>(key: string): T {
    try {
      const reg = this.services.get(key);
      if (!reg) throw new Error(`Service not registered: ${key}`);

      switch (reg.lifetime) {
        case "singleton":
          if (!reg.instance) reg.instance = reg.factory() as T;
          return reg.instance;
        case "scoped":
          throw new Error(
            `Cannot resolve scoped service '${key}' directly from root container.`,
          );
        case "transient":
          return reg.factory() as T;
      }
    } catch (err: any) {
      logger.error(
        `[Container] Resolving dependencies failed: ${err?.message ?? err}`,
      );
      throw new Error(`Service failed to registered: ${key}`);
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
    try {
      if (this.initialized) return;
      this.initialized = true;

      logger.info("Initializing container...");
      await this.coreInitializer.initialize();

      for (const [key, reg] of this.services.entries()) {
        if (reg.lifetime === "singleton") {
          const instance = reg.factory();
          reg.instance =
            instance instanceof Promise ? await instance : instance;
          if (typeof (reg.instance as any).init === "function") {
            await (reg.instance as any).init();
          }
          logger.info(`Initialized singleton: ${key}`);
        }
      }
    } catch (err: any) {
      logger.error(`[Container] Initialization failed: ${err?.message ?? err}`);
      throw new Error(`Creating Container failed`);
    }
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

  get emailService() {
    try {
      return this.resolve("EmailService");
    } catch (err: any) {
      logger.error(
        `[Container] Resolving EmailService failed: ${err?.message ?? err}`,
      );
      throw new Error(`Resolving EmailService failed`);
    }
  }

  get fileService() {
    try {
      return this.resolve("FileService");
    } catch (err: any) {
      logger.error(
        `[Container] Resolving FileService failed: ${err?.message ?? err}`,
      );
      throw new Error(`Resolving FileService failed`);
    }
  }

  get basicTokenService() {
    try {
      return this.resolve("BasicTokenService");
    } catch (err: any) {
      logger.error(
        `[Container] Resolving BasicTokenService failed: ${err?.message ?? err}`,
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
          `  • ${key.padEnd(20)} | Lifetime: ${reg.lifetime.padEnd(10)} | ${status}`,
        );
      }
    } catch (err: any) {
      logger.error(
        `[Container] Printing diagnostics failed: ${err?.message ?? err}`,
      );
      throw new Error(`Printing diagnostics failed`);
    }
  }
}

class ScopedContainer {
  private readonly scopeInstances = new Map<string, any>();

  constructor(private readonly root: Container) {}

  resolve<T>(key: string): T {
    const reg = (this.root as any).services.get(key) as Registration<T>;
    if (!reg) throw new Error(`Service not registered: ${key}`);

    switch (reg.lifetime) {
      case "singleton":
        return this.root.resolve<T>(key);
      case "scoped":
        if (!this.scopeInstances.has(key)) {
          const instance = reg.factory(this) as T;
          this.scopeInstances.set(key, instance);
        }
        return this.scopeInstances.get(key);
      case "transient":
        return reg.factory(this) as T;
    }
  }

  dispose(): void {
    for (const [key, instance] of this.scopeInstances.entries()) {
      if (typeof instance.dispose === "function") instance.dispose();
      this.scopeInstances.delete(key);
    }
  }
}

export { Container, ScopedContainer };
