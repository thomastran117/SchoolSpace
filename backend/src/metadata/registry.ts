type RouteMetadata = {
  requireAuth?: boolean;
  roles?: string[];
};

const metadataRegistry = new WeakMap<Function, RouteMetadata>();

export function setRouteMetadata(handler: Function, meta: RouteMetadata): void {
  metadataRegistry.set(handler, meta);
}

export function getRouteMetadata(handler: Function): RouteMetadata {
  return metadataRegistry.get(handler) || {};
}
