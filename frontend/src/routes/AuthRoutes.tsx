import LoginPage from "@pages/auth/LoginPage";
import SignupPage from "@pages/auth/SignupPage";
import MicrosoftCallbackPage from "@pages/auth/MicrosoftCallbackPage";
import GoogleCallbackPage from "@pages/auth/GoogleCallbackPage";

type AppRoute = {
  path: string;
  element: React.ReactElement;
};

const authRoutes: AppRoute[] = [
  { path: "/auth/login", element: <LoginPage /> },
  { path: "/auth/signup", element: <SignupPage /> },
  { path: "/auth/google", element: <GoogleCallbackPage /> },
  { path: "/auth/microsoft", element: <MicrosoftCallbackPage /> },
];

export default authRoutes;