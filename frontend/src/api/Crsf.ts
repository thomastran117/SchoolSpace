import axios, { AxiosError } from "axios";
import environment from "../configuration/Environment";

const BASE_URL: string = environment.backend_url;
const CSRF_TIMEOUT_MS = 8_000;

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

const CsrfClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: CSRF_TIMEOUT_MS,
});

function isTimeoutError(err: AxiosError) {
  const code = (err as any).code as string | undefined;
  return (
    code === "ECONNABORTED" ||
    code === "ETIMEDOUT" ||
    (typeof err.message === "string" &&
      err.message.toLowerCase().includes("timeout"))
  );
}

export async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  if (!csrfPromise) {
    csrfPromise = CsrfClient.get("/auth/csrf")
      .then((res) => {
        const token = (res.data as any)?.csrfToken;

        if (!token || typeof token !== "string") {
          throw new Error("Invalid CSRF token response");
        }

        csrfToken = token;
        return token;
      })
      .catch((err: AxiosError) => {
        if (isTimeoutError(err)) {
          console.error("[CSRF] Request timed out");
          throw new Error("Unable to contact server (CSRF timeout).");
        }

        console.error("[CSRF] Fetch failed:", err.response?.data ?? err.message);
        throw err;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
}

export function clearCsrfToken() {
  csrfToken = null;
}
