function pathFromRegexp(regexp) {
  const str = regexp && regexp.toString();
  if (!str) return "";
  const match = str.match(/^\/\^\\\/(.+?)\\\/\?\(\?=\\\/\|\$\)\/i?$/) || str.match(/^\/\^\\\/(.+?)\\\/\?\$\/i?$/);
  if (match && match[1]) return "/" + match[1].replace(/\\\//g, "/");
  return "";
}

function walkStack(stack, prefix = "", out = []) {
  for (const layer of stack) {
    if (layer.route) {
      const routePath = layer.route.path || "";
      const methods = Object.keys(layer.route.methods || {}).map(m => m.toUpperCase());
      if (methods.length && routePath !== undefined) {
        out.push({ path: (prefix + routePath) || "/", methods });
      }
      continue;
    }

    if (layer.name === "router" && layer.handle && layer.handle.stack) {
      const mount = (layer.path !== undefined ? layer.path : pathFromRegexp(layer.regexp)) || "";
      walkStack(layer.handle.stack, prefix + mount, out);
      continue;
    }

    if (layer.regexp && layer.handle && !layer.route && !layer.name === "router") {
      continue;
    }
  }
  return out;
}

function listAllRoutes(appOrRouter) {
  const router = appOrRouter && appOrRouter._router ? appOrRouter._router : appOrRouter;
  if (!router || !router.stack) return [];
  const routes = walkStack(router.stack);

  const seen = new Set();
  const unique = [];
  for (const r of routes) {
    const key = `${r.methods.sort().join(",")}:${r.path}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(r);
    }
  }
  unique.sort((a, b) => a.path.localeCompare(b.path));
  return unique;
}

module.exports = { listAllRoutes };
