import Navbar from "./components/Navbar"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import TermsOfService from "./pages/TermAndConditionPage";
import PrivacyPage from "./pages/PrivacyPage";
function App() {

    const handleAuth = async (mode, { name, email, password }) => {

  };

  return (
    <Router>
      <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/term-and-service" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/auth" element={<AuthPage onAuth={handleAuth}/>} />
          
        </Routes>
    </Router>
  )
}

export default App
