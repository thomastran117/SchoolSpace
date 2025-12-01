import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Footer from "./components/shared/Footer";
import Navbar from "./components/shared/Navbar";
import HomePage from "./pages/main/HomePage";
import ServicePage from "./pages/main/ServicePage";
import ContactPage from "./pages/main/ContactPage";
import PrivacyPage from "./pages/main/PrivacyPage";
import PricingPage from "./pages/main/PricingPage";
import AboutPage from "./pages/main/AboutPage";
import TermsAndConditionPage from "./pages/main/TermsAndConditionPage";
import FrequentlyAskedPage from "./pages/main/FrequentlyAskedPage";
import FeaturePage from "./pages/main/FeaturePage";
import NotFoundPage from "./pages/main/NotFoundPage";
import AuthPage from "./pages/auth/AuthPage";
import LoginPage from "./pages/auth/LoginPage";
import GoogleCallbackPage from "./pages/auth/GoogleCallbackPage";
import MicrosoftCallbackPage from "./pages/auth/MicrosoftCallbackPage";
import SignupPage from "./pages/auth/SignupPage";

function App() {
  return (
    <>
      <Router>
        <Navbar />
        <div className="min-h-screen overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/features" element={<FeaturePage />} />
            <Route path="/services" element={<ServicePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route
              path="/terms-and-conditions"
              element={<TermsAndConditionPage />}
            />
            <Route
              path="/frequently-asked-questions"
              element={<FrequentlyAskedPage />}
            />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/google" element={<GoogleCallbackPage />} />
            <Route path="/auth/microsoft" element={<MicrosoftCallbackPage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Footer />
      </Router>
    </>
  );
}

export default App;
