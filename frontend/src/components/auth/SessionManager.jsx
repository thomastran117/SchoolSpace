import { useEffect } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setCredentials, clearCredentials } from "../../stores/authSlice";
import config from "../../configs/envManager";

const SessionManager = () => {
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
          }),
        );
      } catch (err) {
        if (cancelled) return;
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
