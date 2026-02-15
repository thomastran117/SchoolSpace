import axios from "axios";
import environment from "../configuration/Environment";

const BASE_URL: string = environment.backend_url;

let csrfToken: string | null = null;
let csrfPromise: Promise<string> | null = null;

const CsrfClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

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
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
}

export function clearCsrfToken() {
  csrfToken = null;
}
