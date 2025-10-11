import {
  msalInstance,
  microsoftScopes,
  waitForMsal,
} from "../../configs/msalClient";
import { useState, useEffect } from "react";

export default function MicrosoftButton({ disabled = false }) {
  const [msalReady, setMsalReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await waitForMsal();
        if (alive) setMsalReady(true);
      } catch {
        setMsalReady(false);
      }
    })();
    return () => (alive = false);
  }, []);

  const handleMicrosoftOAuth = async () => {
    if (!msalReady || disabled) return;
    await waitForMsal();
    await msalInstance.loginRedirect({
      scopes: microsoftScopes,
      prompt: "select_account",
    });
  };

  return (
    <button
      type="button"
      onClick={handleMicrosoftOAuth}
      disabled={!msalReady || disabled}
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
        boxShadow:
          !msalReady || disabled ? "none" : "0 1px 3px rgba(60, 64, 67, 0.3)",
        cursor: !msalReady || disabled ? "not-allowed" : "pointer",
        opacity: !msalReady || disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (msalReady && !disabled)
          e.currentTarget.style.boxShadow = "0 2px 6px rgba(60, 64, 67, 0.3)";
      }}
      onMouseLeave={(e) => {
        if (msalReady && !disabled)
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(60, 64, 67, 0.3)";
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 23 23"
      >
        <rect width="10" height="10" x="0" y="0" fill="#F35325" />
        <rect width="10" height="10" x="13" y="0" fill="#81BC06" />
        <rect width="10" height="10" x="0" y="13" fill="#05A6F0" />
        <rect width="10" height="10" x="13" y="13" fill="#FFBA08" />
      </svg>
      <span>{msalReady ? "Microsoft" : "Loading..."}</span>
    </button>
  );
}
