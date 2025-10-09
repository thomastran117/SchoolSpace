import AuthPage from "../pages/AuthPage";
import GoogleCallback from "../pages/auth/GoogleCallback";
import MicrosoftCallback from "../pages/auth/MicrosoftCallback";
import VerifyPage from "../pages/auth/VerifyPage";

const authRoutes = [
  { path: "/auth", element: <AuthPage /> },
  { path: "/auth/google", element: <GoogleCallback /> },
  { path: "/auth/microsoft", element: <MicrosoftCallback /> },
  { path: "/auth/verify", element: <VerifyPage /> },
];

export default authRoutes;
