/**
 * @file container.ts
 * @description
 * Acts as the central dependency injection container.
 * Supports service registration with lifetimes (singleton/transient)
 * and provides an async initialize() method to prepare all singletons
 * before the server starts.
 */

import { CacheService } from "../service/cacheService";
import { EmailService } from "../service/emailService";
import { AuthService } from "../service/authService";
import { BasicTokenService, TokenService } from "../service/tokenService";
import { AuthController } from "../controller/authController";
import logger from "../utility/logger";

import { initRedis } from "./redis";
import { initPrisma } from "./prisma";

type Lifetime = "singleton" | "transient";

interface Registration<T> {
  factory: (...deps: any[]) => T | Promise<T>;
  lifetime: Lifetime;
  instance?: T;
}

class Container {
  private static _instance: Container;
  private readonly services = new Map<string, Registration<any>>();
  private initialized = false;

  private constructor() {
    this.register("CacheService", () => new CacheService(), "singleton");
    this.register("EmailService", () => new EmailService(), "singleton");
    this.register(
      "BasicTokenService",
      () => new BasicTokenService(),
      "singleton",
    );

    this.register(
      "TokenService",
      () => new TokenService(this.resolve("CacheService")),
      "transient",
    );

    this.register(
      "AuthService",
      () =>
        new AuthService(
          this.resolve("EmailService"),
          this.resolve("TokenService"),
        ),
      "transient",
    );

    this.register(
      "AuthController",
      () => new AuthController(this.resolve("AuthService")),
      "transient",
    );
  }

  public static get instance(): Container {
    if (!this._instance) {
      this._instance = new Container();
    }
    return this._instance;
  }

  private register<T>(
    key: string,
    factory: (...deps: any[]) => T | Promise<T>,
    lifetime: Lifetime = "singleton",
  ): void {
    this.services.set(key, { factory, lifetime });
  }

  public resolve<T>(key: string): T {
    const reg = this.services.get(key);
    if (!reg) throw new Error(`Service not registered: ${key}`);

    if (reg.lifetime === "singleton") {
      if (!reg.instance) reg.instance = reg.factory() as T;
      return reg.instance;
    }

    return reg.factory() as T;
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    await this.initializeInfrastructure();

    for (const [key, reg] of this.services.entries()) {
      if (reg.lifetime === "singleton") {
        try {
          const instance = reg.factory();
          reg.instance =
            instance instanceof Promise ? await instance : instance;

          if (typeof (reg.instance as any).init === "function") {
            await (reg.instance as any).init();
          }
        } catch (err: any) {
          logger.error(`❌ Failed to initialize ${key}: ${err.message}`);
          process.exit(1);
        }
      }
    }
  }

  private async initializeInfrastructure(): Promise<void> {
    try {
      await initPrisma();
      await initRedis();
    } catch (err: any) {
      process.exit(1);
    }
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
  get authController(): AuthController {
    return this.resolve("AuthController");
  }
}

const container = Container.instance;
export default container;
