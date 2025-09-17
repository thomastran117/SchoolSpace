import { PublicClientApplication } from "@azure/msal-browser";

const MSAL_CLIENT_ID = import.meta.env.VITE_MSAL_CLIENT_ID;
const MSAL_AUTHORITY =
  import.meta.env.VITE_MSAL_AUTHORITY;
const MSAL_REDIRECT_URI =
  import.meta.env.VITE_MSAL_REDIRECT_URI 

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: MSAL_CLIENT_ID,
    authority: MSAL_AUTHORITY,
    redirectUri: MSAL_REDIRECT_URI,
  },
  cache: { cacheLocation: "localStorage", storeAuthStateInCookie: false },
});

export const microsoftScopes = ["openid", "profile", "email"];

let _msalReady;
export function waitForMsal() {
  if (!_msalReady) _msalReady = msalInstance.initialize();
  return _msalReady;
}
