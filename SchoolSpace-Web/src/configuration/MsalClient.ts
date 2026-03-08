import type { Configuration } from "@azure/msal-browser";
import { PublicClientApplication } from "@azure/msal-browser";
import environment from "./Environment";

const msalConfig: Configuration = {
  auth: {
    clientId: environment.ms_client,
    authority: environment.msal_authority,
    redirectUri: `${environment.frontend_url}/auth/microsoft`,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
export const microsoftScopes: string[] = ["openid", "profile", "email"];

let _msalReady: Promise<void> | null = null;

export function waitForMsal(): Promise<void> {
  if (!_msalReady) {
    _msalReady = msalInstance.initialize();
  }
  return _msalReady;
}
