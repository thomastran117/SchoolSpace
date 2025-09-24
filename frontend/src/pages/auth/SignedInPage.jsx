import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SignedIn() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("token");
    const role = params.get("role") ?? "user";

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      window.history.replaceState({}, "", "/");
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  return <p>Finishing sign-in…</p>;
}
