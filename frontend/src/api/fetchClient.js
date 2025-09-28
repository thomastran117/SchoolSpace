import { store } from "../stores";
import { setCredentials, clearCredentials } from "../stores/authSlice";
import config from "../configs/envManager";

const BASE_URL = config.backend_url;

let refreshPromise = null;

async function refreshToken(state) {
  try {
    const refreshResp = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "GET",
      credentials: "include",
    });

    if (!refreshResp.ok) {
      store.dispatch(clearCredentials());
      throw new Error("Failed to refresh");
    }

    const data = await refreshResp.json();
    const accessToken = data.accessToken;

    store.dispatch(
      setCredentials({
        token: accessToken,
        role: data.user?.role || state.auth.role,
        email: data.user?.email || state.auth.email,
      })
    );

    return accessToken;
  } catch (err) {
    store.dispatch(clearCredentials());
    throw err;
  }
}

export async function fetchWithAuth(input, init = {}) {
  const state = store.getState();
  let token = state.auth.token;

  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${BASE_URL}${input}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    // Only one refresh at a time
    if (!refreshPromise) {
      refreshPromise = refreshToken(state).finally(() => {
        refreshPromise = null;
      });
    }
    const newToken = await refreshPromise;

    const retryHeaders = new Headers(init.headers || {});
    retryHeaders.set("Authorization", `Bearer ${newToken}`);

    response = await fetch(`${BASE_URL}${input}`, {
      ...init,
      headers: retryHeaders,
      credentials: "include",
    });
  }

  return response;
}