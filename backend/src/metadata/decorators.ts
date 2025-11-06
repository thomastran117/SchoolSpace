import { setRouteMetadata } from "./registry";

export function requireAuth(handler: Function): Function {
  setRouteMetadata(handler, { requireAuth: true });
  return handler;
}

export function requireRoles(roles: string[]): (handler: Function) => Function {
  return (handler: Function): Function => {
    setRouteMetadata(handler, { requireAuth: true, roles });
    return handler;
  };
}
