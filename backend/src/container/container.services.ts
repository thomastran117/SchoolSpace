import { CacheService } from "../service/cacheService";
import { EmailService } from "../service/emailService";
import { FileService } from "../service/fileService";
import { BasicTokenService, TokenService } from "../service/tokenService";
import { OAuthService } from "../service/oauthService";
import { PaymentService } from "../service/paymentService";
import { WebService } from "../service/webService";
import { AuthService } from "../service/authService";
import type { Registration } from "./container.types";

export function registerServiceModules(): Map<string, Registration<any>> {
  const services = new Map<string, Registration<any>>();

  services.set("CacheService", {
    factory: () => new CacheService(),
    lifetime: "singleton",
  });
  services.set("EmailService", {
    factory: () => new EmailService(),
    lifetime: "singleton",
  });
  services.set("FileService", {
    factory: () => new FileService(),
    lifetime: "singleton",
  });
  services.set("BasicTokenService", {
    factory: () => new BasicTokenService(),
    lifetime: "singleton",
  });

  services.set("WebService", {
    factory: () => new WebService(),
    lifetime: "scoped",
  });

  services.set("TokenService", {
    factory: (scope) => new TokenService(scope.resolve("CacheService")),
    lifetime: "scoped",
  });

  services.set("PaymentService", {
    factory: (scope) => new PaymentService(scope.resolve("WebService")),
    lifetime: "scoped",
  });

  services.set("OAuthService", {
    factory: () => new OAuthService(),
    lifetime: "scoped",
  });

  services.set("AuthService", {
    factory: (scope) =>
      new AuthService(
        scope.resolve("EmailService"),
        scope.resolve("TokenService"),
        scope.resolve("OAuthService"),
        scope.resolve("WebService"),
      ),
    lifetime: "scoped",
  });

  return services;
}
