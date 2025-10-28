import "reflect-metadata";
import { META_REQUIRE_AUTH, META_ROLES } from "../constants/metadata";

function RequireAuth() {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(META_REQUIRE_AUTH, true, target, key);
    return descriptor;
  };
}

function Roles(...roles: string[]) {
  return function (target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(META_ROLES, roles, target, key);
    return descriptor;
  };
}

export { RequireAuth, Roles };