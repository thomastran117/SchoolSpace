import { AuthController } from "../controller/authController";
import { PaymentController } from "../controller/paymentController";
import { FileController } from "../controller/fileController";
import type { Registration } from "./container.types";

export function registerControllerModules(): Map<string, Registration<any>> {
  const controllers = new Map<string, Registration<any>>();

  controllers.set("AuthController", {
    factory: (scope) => new AuthController(scope.resolve("AuthService")),
    lifetime: "transient",
  });

  controllers.set("PaymentController", {
    factory: (scope) => new PaymentController(scope.resolve("PaymentService")),
    lifetime: "transient",
  });

  controllers.set("FileController", {
    factory: (scope) => new FileController(scope.resolve("FileService")),
    lifetime: "transient",
  });

  return controllers;
}
