import { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials } from "../../stores/authSlice";
import config from "../../configs/envManager";

const SessionManager = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const initSession = async () => {
      try {
        const res = await axios.get(`${config.backend_url}/auth/refresh`, {
          withCredentials: true,
        });

        if (cancelled) return;

        const { accessToken, email, role } = res.data;
        dispatch(
          setCredentials({
            token: accessToken,
            email,
            role,
          })
        );
      } catch (err) {
        if (cancelled) return;
        dispatch(clearCredentials());
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initSession();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center vh-100 text-center"
        style={{
          background:
            "linear-gradient(135deg, #f6fffa 0%, #eafaf0 40%, #dff5e6 100%)",
          color: "#2e7d32",
        }}
      >
        <div
          className="spinner-border text-success"
          role="status"
          style={{ width: "3.5rem", height: "3.5rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>

        <h5 className="mt-4 fw-semibold" style={{ color: "#388e3c" }}>
          Initializing your session...
        </h5>
        <p className="mt-2" style={{ color: "#4caf50", opacity: 0.8 }}>
          Please wait a few moments while we securely refresh your account.
        </p>
      </div>
    );
  }

  return children;
};

export default SessionManager;
