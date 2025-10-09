import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import config from "../configs/envManager";

export function AuthManager() {
  const accessToken = useSelector((state) => state.auth.accessToken);
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (accessToken) {
        setIsAuthenticated(true);
        return;
      }

      try {
        const res = await axios.get(`${config.backend_url}/auth/refresh`, {
          withCredentials: true,
        });
        if (res.status === 200) setIsAuthenticated(true);
        else setIsAuthenticated(false);
      } catch {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [accessToken]);

  return isAuthenticated;
}
