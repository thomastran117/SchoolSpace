import HomePage from "../pages/main/HomePage";
import AboutPage from "../pages/main/AboutPage";
import FeaturesPage from "../pages/main/FeaturePage";
import PricingPage from "../pages/main/PricingPage";
import ServicesPage from "../pages/main/ServicePage";
import ContactPage from "../pages/main/ContactPage";
import FaqPage from "../pages/main/FrequentlyAskedQuestionPage";
import TermsOfService from "../pages/main/TermAndConditionPage";
import PrivacyPage from "../pages/main/PrivacyPage";
import Dashboard from "../pages/TestPage";
import PayPalCheckout from "../pages/PaymentPage";

const mainRoutes = [
  { path: "/", element: <HomePage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/features", element: <FeaturesPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/services", element: <ServicesPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/faq", element: <FaqPage /> },
  { path: "/term-and-service", element: <TermsOfService /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/pay", element: <PayPalCheckout /> },
];

export default mainRoutes;
