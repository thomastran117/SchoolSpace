import config from "../../configs/envManager";

export default function GoogleButton({ disabled = false }) {
  const handleGoogleOAuth = () => {
    if (disabled) return;

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = `${config.frontend_url}/auth/google`;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "id_token",
      scope: "openid email profile",
      nonce: crypto.randomUUID(),
      prompt: "select_account",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  };

  return (
    <button
      type="button"
      className="btn text-white d-flex align-items-center justify-content-center"
      onClick={handleGoogleOAuth}
      disabled={disabled}
      style={{
        backgroundColor: "#DB4437",
        borderRadius: "6px",
        padding: "6px 14px",
        minWidth: "140px",
        transition: "all 0.2s ease",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <i className="bi bi-google me-2"></i> Google
    </button>
  );
}
