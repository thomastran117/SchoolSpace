import { initRedis } from "./redis";
import { initPrisma } from "./prisma";
import { initMongo } from "./mongo";
import { AuthController } from "../controller/authController";

import { AuthService } from "../service/authService";
import { BasicTokenService, TokenService } from "../service/tokenService";
import { CacheService } from "../service/cacheService";
import { EmailService } from "../service/emailService";

import logger from "../utility/logger";

type Lifetime = "singleton" | "transient" | "scoped";

interface Registration<T> {
  factory: (...deps: any[]) => T | Promise<T>;
  lifetime: Lifetime;
  instance?: T;
}

class Container {
  private static _instance: Container;
  protected readonly services = new Map<string, Registration<any>>();
  private initialized = false;

  protected constructor() {
    this.register("CacheService", () => new CacheService(), "singleton");
    this.register("EmailService", () => new EmailService(), "singleton");
    this.register(
      "BasicTokenService",
      () => new BasicTokenService(),
      "singleton",
    );

    this.register(
      "TokenService",
      (scope) => new TokenService(scope.resolve("CacheService")),
      "scoped",
    );

    this.register(
      "AuthService",
      (scope) =>
        new AuthService(
          scope.resolve("EmailService"),
          scope.resolve("TokenService"),
        ),
      "scoped",
    );

    this.register(
      "AuthController",
      (scope) => new AuthController(scope.resolve("AuthService")),
      "transient",
    );
  }

  public static get instance(): Container {
    if (!this._instance) this._instance = new Container();
    return this._instance;
  }

  protected register<T>(
    key: string,
    factory: (...deps: any[]) => T | Promise<T>,
    lifetime: Lifetime = "singleton",
  ): void {
    this.services.set(key, { factory, lifetime });
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
          `Cannot resolve scoped service '${key}' directly from root container. Use a scope.`,
        );

      case "transient":
        return reg.factory() as T;

      default:
        throw new Error(`Unknown lifetime: ${reg.lifetime}`);
    }
  }

  public createScope(): ScopedContainer {
    return new ScopedContainer(this);
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    logger.info("Initializing infrastructure...");
    await this.initializeInfrastructure();

    logger.info("Initializing singleton services...");
    for (const [key, reg] of this.services.entries()) {
      if (reg.lifetime === "singleton") {
        try {
          const instance = reg.factory();
          reg.instance =
            instance instanceof Promise ? await instance : instance;

          if (typeof (reg.instance as any).init === "function") {
            await (reg.instance as any).init();
          }

          logger.info(`Initialized singleton: ${key}`);
        } catch (err: any) {
          logger.error(`Failed to initialize ${key}: ${err.message}`);
          process.exit(1);
        }
      }
    }

    logger.info("Container initialized successfully.");
  }

  private async initializeInfrastructure(): Promise<void> {
    try {
      await initPrisma();
      await initRedis();
      await initMongo();
    } catch (err: any) {
      process.exit(1);
    }
  }

  public printDiagnostics(): void {
    logger.info("Container Diagnostics");

    const padKey =
      Math.max(...Array.from(this.services.keys()).map((k) => k.length)) + 2;

    for (const [key, reg] of this.services.entries()) {
      const status = reg.instance ? "✔ instantiated" : "⏳ pending";

      const lifetimeColored =
        reg.lifetime === "singleton"
          ? "🟦 singleton"
          : reg.lifetime === "scoped"
            ? "🟨 scoped"
            : "🟪 transient";

      logger.info(
        `  • ${key.padEnd(padKey)} | Lifetime: ${lifetimeColored.padEnd(14)} | Status: ${status}`,
      );
    }

    logger.info("Diagnostic report complete");
  }

  get cacheService(): CacheService {
    return this.resolve("CacheService");
  }

  get emailService(): EmailService {
    return this.resolve("EmailService");
  }

  get basicTokenService(): BasicTokenService {
    return this.resolve("BasicTokenService");
  }
}

class ScopedContainer {
  private readonly scopeInstances = new Map<string, any>();

  constructor(private readonly root: Container) {}

  resolve<T>(key: string): T {
    const reg = (this.root as any).services.get(key) as
      | Registration<T>
      | undefined;
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

const container = Container.instance;
export default container;
export { ScopedContainer };
