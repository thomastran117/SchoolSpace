import AboutPage from "@/pages/main/AboutPage";
import PrivacyPage from "@/pages/main/PrivacyPage";
import ServicesPage from "@/pages/main/ServicesPage";
import TermsAndConditionsPage from "@/pages/main/TermsAndConditionPage";
import HomePage from "@pages/main/HomePage";

type AppRoute = {
  path: string;
  element: React.ReactElement;
};

const mainRoutes: AppRoute[] = [
  { path: "/", element: <HomePage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/services", element: <ServicesPage /> },
  { path: "/terms-and-conditions", element: <TermsAndConditionsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
];

export default mainRoutes;
