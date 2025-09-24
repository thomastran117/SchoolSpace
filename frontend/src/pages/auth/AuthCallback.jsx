import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.substring(1));
    const id_token = hash.get("id_token");

    if (!id_token) {
      console.error("Missing id_token from Google");
      navigate("/login");
      return;
    }

    (async () => {
      try {
        const resp = await fetch(
          "http://localhost:8040/api/auth/google/verify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token: id_token }),
          },
        );

        if (!resp.ok) throw new Error(await resp.text());
        const data = await resp.json();
        console.log("Google OAuth success:", data);

        navigate("/dashboard");
      } catch (err) {
        console.error("Google verify failed", err);
        navigate("/login");
      }
    })();
  }, [navigate]);

  return <p>Signing you in with Google…</p>;
}
