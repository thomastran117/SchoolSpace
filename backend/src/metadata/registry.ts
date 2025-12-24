type RouteMetadata = {
  requireAuth?: boolean;
  roles?: string[];
};

type AnyFunction = (...args: unknown[]) => unknown;

const metadataRegistry = new WeakMap<AnyFunction, RouteMetadata>();

export function setRouteMetadata<T extends AnyFunction>(
  handler: T,
  meta: RouteMetadata
): void {
  metadataRegistry.set(handler, meta);
}

export function getRouteMetadata<T extends AnyFunction>(
  handler: T
): RouteMetadata {
  return metadataRegistry.get(handler) ?? {};
}
