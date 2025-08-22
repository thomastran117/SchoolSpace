const { AsyncLocalStorage } = require("async_hooks");
const crypto = require("crypto");

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

module.exports = { requestContext, getContext };