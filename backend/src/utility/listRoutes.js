/* ------- robust router walker (Express 4/5) ------- */
function listRoutesFromRouter(rtr) {
  const out = [];
  walk(rtr, "", out);

  // dedupe + sort
  const seen = new Set(),
    uniq = [];
  for (const r of out) {
    const key = `${r.path}|${r.methods.slice().sort().join(",")}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniq.push(r);
    }
  }
  return uniq.sort((a, b) => a.path.localeCompare(b.path));
}

function walk(routerOrLayer, prefix, out) {
  const stack =
    routerOrLayer.stack || (routerOrLayer.handle && routerOrLayer.handle.stack);
  if (!Array.isArray(stack)) return;

  for (const layer of stack) {
    if (layer.route && layer.route.path != null) {
      const routePath = normalize(layer.route.path);
      const methods = Object.keys(layer.route.methods || {}).map((m) =>
        m.toUpperCase(),
      );
      if (methods.length) out.push({ path: join(prefix, routePath), methods });
      continue;
    }

    // nested router
    if (
      layer.name === "router" &&
      layer.handle &&
      Array.isArray(layer.handle.stack)
    ) {
      const mount = mountFromLayer(layer) || "/";
      walk(layer.handle, join(prefix, mount), out);
    }
  }
}

function normalize(p) {
  if (!p) return "/";
  if (Array.isArray(p)) p = p[0];
  return p.startsWith("/") ? p : `/${p}`;
}
function join(a, b) {
  if (!a || a === "/") return b;
  if (!b || b === "/") return a;
  return `${a}${b}`;
}

/**
 * Try multiple strategies to recover the literal mount from a router layer.
 * Handles common outputs from path-to-regexp across Express 4/5.
 */
function mountFromLayer(layer) {
  // Express 5 sometimes exposes .path directly on the layer
  if (typeof layer.path === "string" && layer.path.length)
    return normalize(layer.path);

  const rx = layer.regexp;
  if (!rx) return "/";

  // Root mounts often have fast_slash true
  if (rx.fast_slash) return "/";

  const src = rx.toString();

  // Try multiple patterns (order matters). We capture the first literal segment after '^\/'
  const patterns = [
    // /^\/auth\/?(?=\/|$)/i
    /^\/\^\\\/([^\\]+?)\\\/\?\(\?\=\\\/\|\$\)\/i?$/,
    // /^\/auth(?:\/(?=$))?$/i
    /^\/\^\\\/([^\\]+?)\(\?:\\\/\(\?\=\$\)\)\?\$\/i?$/,
    // /^\/auth\/?$/i
    /^\/\^\\\/([^\\]+?)\\\/\?\$\/i?$/,
    // /^\/auth(?=\/|$)/i
    /^\/\^\\\/([^\\]+?)\(\?\=\\\/\|\$\)\/i?$/,
    // More relaxed fallback: grab after ^\/ up to next delimiter
    /^\/\^\\\/([^\\\/\(\?]+)[\\\/\(\?\$]/i,
  ];

  for (const re of patterns) {
    const m = src.match(re);
    if (m && m[1]) return `/${m[1].replace(/\\\//g, "/")}`;
  }

  // Last resort: attempt to parse something like /^\/(auth)\/?/i
  const loose = src.match(/^\/\^\\\/([^\/]+?)\\?\//i);
  if (loose && loose[1]) return `/${loose[1]}`;

  return "/"; // treat as root if we can't recover it
}

export default listRoutesFromRouter;
