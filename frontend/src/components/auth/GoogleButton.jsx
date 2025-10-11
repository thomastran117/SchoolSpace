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
      onClick={handleGoogleOAuth}
      disabled={disabled}
      className="d-flex align-items-center justify-content-center gap-2 border"
      style={{
        backgroundColor: "#fff",
        borderColor: "#dadce0",
        borderRadius: "6px",
        padding: "8px 16px",
        minWidth: "150px",
        fontWeight: 500,
        fontSize: "15px",
        color: "#3c4043",
        transition: "all 0.2s ease",
        boxShadow: disabled ? "none" : "0 1px 3px rgba(60, 64, 67, 0.3)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled)
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(60, 64, 67, 0.3)";
      }}
      onMouseLeave={(e) => {
        if (!disabled)
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(60, 64, 67, 0.3)";
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 48 48"
      >
        <path
          fill="#EA4335"
          d="M24 9.5c3.94 0 7.06 1.64 9.18 3.01l6.85-6.85C36.41 2.69 30.67 0 24 0 14.64 0 6.54 5.39 2.44 13.22l7.98 6.2C12.14 13.14 17.58 9.5 24 9.5z"
        />
        <path
          fill="#34A853"
          d="M46.53 24.5c0-1.56-.14-3.06-.41-4.5H24v9.02h12.7c-.55 2.86-2.22 5.28-4.7 6.91l7.27 5.64C43.89 37.72 46.53 31.65 46.53 24.5z"
        />
        <path
          fill="#4A90E2"
          d="M9.42 28.02A14.48 14.48 0 0 1 9 24c0-1.39.24-2.74.66-4.02l-7.98-6.2A23.8 23.8 0 0 0 0 24c0 3.87.93 7.53 2.55 10.78l8.03-6.76z"
        />
        <path
          fill="#FBBC05"
          d="M24 48c6.48 0 11.92-2.13 15.9-5.82l-7.27-5.64c-2.02 1.35-4.59 2.15-8.63 2.15-6.42 0-11.86-3.64-13.98-8.52l-8.03 6.76C6.54 42.61 14.64 48 24 48z"
        />
      </svg>
      <span>Google</span>
    </button>
  );
}
