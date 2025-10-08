import { PublicClientApplication } from "@azure/msal-browser";
import config from "./envManager";

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: config.ms_client,
    authority: config.msal_authority,
    redirectUri: `http://localhost:3040/auth/microsoft`,
    navigateToLoginRequestUrl: false,
  },
  cache: { cacheLocation: "localStorage", storeAuthStateInCookie: false },
});

export const microsoftScopes = ["openid", "profile", "email"];

let _msalReady;
export function waitForMsal() {
  if (!_msalReady) _msalReady = msalInstance.initialize();
  return _msalReady;
}
