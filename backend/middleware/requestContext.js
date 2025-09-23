import { AsyncLocalStorage } from "async_hooks";
import crypto from "crypto";

const als = new AsyncLocalStorage();

function requestContext(req, _res, next) {
  const store = {
    requestId: req.headers["x-request-id"] || crypto.randomUUID(),
    userId: req.user?.id || null,
  };
  als.run(store, () => next());
}

function getContext() {
  return als.getStore() || {};
}

export { requestContext, getContext };
