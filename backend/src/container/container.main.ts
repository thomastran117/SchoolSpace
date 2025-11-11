import logger from "../utility/logger";
import type { Lifetime, Registration } from "./container.types";
import { CoreInitializer } from "./container.core";
import { registerServiceModules } from "./container.services";
import { registerControllerModules } from "./container.controllers";

export class Container {
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
  }

  public createScope(): ScopedContainer {
    return new ScopedContainer(this);
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    logger.info("Initializing container...");
    await this.coreInitializer.initialize();

    for (const [key, reg] of this.services.entries()) {
      if (reg.lifetime === "singleton") {
        const instance = reg.factory();
        reg.instance = instance instanceof Promise ? await instance : instance;
        if (typeof (reg.instance as any).init === "function") {
          await (reg.instance as any).init();
        }
        logger.info(`Initialized singleton: ${key}`);
      }
    }
  }

  get cacheService() {
    return this.resolve("CacheService");
  }

  get emailService() {
    return this.resolve("EmailService");
  }

  get fileService() {
    return this.resolve("FileService");
  }

  get basicTokenService() {
    return this.resolve("BasicTokenService");
  }

  printDiagnostics(): void {
    logger.info("Container Diagnostics:");
    for (const [key, reg] of this.services.entries()) {
      const status = reg.instance ? "✔ instantiated" : "⏳ pending";
      logger.info(
        `  • ${key.padEnd(20)} | Lifetime: ${reg.lifetime.padEnd(10)} | ${status}`,
      );
    }
  }
}

export class ScopedContainer {
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
