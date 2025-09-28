const config = {
  google_client: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  ms_client: import.meta.env.VITE_MSAL_CLIENT_ID || "",
  msal_authority: import.meta.env.VITE_MSAL_AUTHORITY || "",
  backend_url: import.meta.env.VITE_BACKEND_URL || "http://localhost:8040",
  frontend_url: import.meta.env.VITE_FRONTEND_URL || "http://localhost:3040",
};

if (!config.google_client) {
  console.warn("Missing VITE_GOOGLE_CLIENT_ID in .env file");
}
if (!config.ms_client) {
  console.warn("Missing VITE_MS_CLIENT_ID in .env file");
}

export default config;
