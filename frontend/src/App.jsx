import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/main/HomePage";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/main/AboutPage";
import PricingPage from "./pages/main/PricingPage";
import TermsOfService from "./pages/main/TermAndConditionPage";
import PrivacyPage from "./pages/main/PrivacyPage";
import FeaturesPage from "./pages/main/FeaturePage";
import ServicesPage from "./pages/main/ServicePage";
import ContactPage from "./pages/main/ContactPage";
import FaqPage from "./pages/main/FrequentlyAskedQuestionPage";
import AuthCallback from "./pages/auth/AuthCallBack";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/term-and-service" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
