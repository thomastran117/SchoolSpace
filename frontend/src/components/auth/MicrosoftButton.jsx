import { msalInstance, microsoftScopes, waitForMsal } from "../../auth/msalClient";
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
      className="btn text-white d-flex align-items-center justify-content-center"
      onClick={handleMicrosoftOAuth}
      disabled={!msalReady || disabled}
      style={{
        backgroundColor: "#2F2F2F",
        borderRadius: "6px",
        padding: "6px 14px",
        minWidth: "140px",
        transition: "all 0.2s ease",
        opacity: !msalReady || disabled ? 0.6 : 1,
      }}
    >
      <i className="bi bi-microsoft me-2"></i>
      {msalReady ? "Microsoft" : "Loading..."}
    </button>
  );
}
