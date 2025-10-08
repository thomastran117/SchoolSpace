import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials } from "../../stores/authSlice";
import api from "../../api";

const SessionManager = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    let cancelled = false;

    const initSession = async () => {
      try {
        const res = await api.get("/auth/refresh");
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
        console.warn("No valid session found:", err.message);
        dispatch(clearCredentials());
      }
    };

    initSession();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return null;
};

export default SessionManager;
