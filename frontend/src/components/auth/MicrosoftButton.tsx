import React, { useState, useEffect } from "react";
import {
  msalInstance,
  microsoftScopes,
  waitForMsal,
} from "../../configuration/MsalClient";

interface MicrosoftButtonProps {
  disabled?: boolean;
}

const MicrosoftButton: React.FC<MicrosoftButtonProps> = ({
  disabled = false,
}) => {
  const [msalReady, setMsalReady] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        await waitForMsal();
        if (alive) setMsalReady(true);
      } catch {
        if (alive) setMsalReady(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const isDisabled = disabled || !msalReady;

  const handleMicrosoftOAuth = async () => {
    if (isDisabled) return;

    await msalInstance.loginRedirect({
      scopes: microsoftScopes,
      prompt: "select_account",
    });
  };

  return (
    <button
      type="button"
      onClick={handleMicrosoftOAuth}
      disabled={disabled}
      className={`
      group flex items-center justify-center gap-3
      h-11 w-full
      rounded-xl
      bg-white
      border border-slate-200
      text-sm font-medium text-slate-700
      shadow-sm
      transition
      focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:ring-offset-2
      ${
        disabled
          ? "cursor-not-allowed opacity-60"
          : "cursor-pointer hover:bg-slate-50 hover:border-slate-300"
      }
    `}
    >
      {/* Microsoft icon */}
      <svg width="18" height="18" viewBox="0 0 23 23">
        <rect width="10" height="10" x="0" y="0" fill="#F35325" />
        <rect width="10" height="10" x="13" y="0" fill="#81BC06" />
        <rect width="10" height="10" x="0" y="13" fill="#05A6F0" />
        <rect width="10" height="10" x="13" y="13" fill="#FFBA08" />
      </svg>

      <span>{msalReady ? "Microsoft" : "Loading..."}</span>
    </button>
  );
};

export default MicrosoftButton;
