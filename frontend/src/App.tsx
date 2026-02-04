import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "@components/header/Header";
import Footer from "@components/footer/Footer";
import HomePage from "@pages/main/HomePage";
import HomePage2 from "@pages/main/HomePage2";
import HomePage3 from "@pages/main/HomePage3";
import LoginPage from "@pages/auth/LoginPage";
import SignupPage from "@pages/auth/SignupPage";
import MicrosoftCallbackPage from "@pages/auth/MicrosoftCallbackPage";
import GoogleCallbackPage from "@pages/auth/GoogleCallbackPage";
import SessionManager from "@components/auth/SessionManager";

function App() {
  return (
    <Router>
      <SessionManager>
        <Header />
        <div className="min-h-screen overflow-y-auto overflow-x-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/home2" element={<HomePage2 />} />
            <Route path="/home3" element={<HomePage3 />} />
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
