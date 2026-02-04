import AboutPage from "@/pages/main/AboutPage";
import PrivacyPage from "@/pages/main/PrivacyPage";
import ServicesPage from "@/pages/main/ServicesPage";
import TermsAndConditionsPage from "@/pages/main/TermsAndConditionPage";
import HomePage from "@pages/main/HomePage";
import HomePage2 from "@pages/main/HomePage2";
import HomePage3 from "@pages/main/HomePage3";

type AppRoute = {
  path: string;
  element: React.ReactElement;
};

const mainRoutes: AppRoute[] = [
  { path: "/", element: <HomePage /> },
  { path: "/home2", element: <HomePage2 /> },
  { path: "/home3", element: <HomePage3 /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/services", element: <ServicesPage /> },
  { path: "/terms-and-conditions", element: <TermsAndConditionsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
];

export default mainRoutes;
