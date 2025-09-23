import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import AboutPage from "./pages/AboutPage";
import PricingPage from "./pages/PricingPage";
import TermsOfService from "./pages/TermAndConditionPage";
import PrivacyPage from "./pages/PrivacyPage";
import SignedInPage from "./pages/auth/SignedInPage";
import FeaturesPage from "./pages/FeaturePage";
import ServicesPage from "./pages/ServicePage";
import ContactPage from "./pages/ContactPage";
import FaqPage from "./pages/FrequentlyAskedQuestionPage";
function App() {

    const handleAuth = async (mode, { name, email, password }) => {

  };

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
          <Route path="/auth" element={<AuthPage onAuth={handleAuth}/>} />
          <Route path="/auth/signed-in" element={<SignedInPage />} />
        </Routes>
        <Footer/>
    </Router>
  )
}

export default App
