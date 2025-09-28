import AuthPage from "../pages/AuthPage";
import AuthCallback from "../pages/auth/AuthCallback";
import VerifyPage from "../pages/auth/VerifyPage";

const authRoutes = [
  { path: "/auth", element: <AuthPage /> },
  { path: "/auth/callback", element: <AuthCallback /> },
  { path: "/verify", element: <VerifyPage /> },
];

export default authRoutes;
