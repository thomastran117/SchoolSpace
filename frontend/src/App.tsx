import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/shared/Navbar";
import Footer from "./components/shared/Footer";
import HomePage from "./pages/main/HomePage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import MicrosoftCallbackPage from "./pages/auth/MicrosoftCallbackPage";
import GoogleCallbackPage from "./pages/auth/GoogleCallbackPage";
import SessionManager from "./components/auth/SessionManager";

function App() {
  return (
    <Router>
      <SessionManager>
        <Navbar />
        <div className="min-h-screen overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/google" element={<GoogleCallbackPage />} />
            <Route path="/auth/microsoft" element={<MicrosoftCallbackPage />} />
          </Routes>
        </div>
        <Footer />
      </SessionManager>
    </Router>
  );
}

export default App;
