import { BrowserRouter as Router } from "react-router-dom";
import "./App.css";
import Header from "@components/header/Header";
import Footer from "@components/footer/Footer";
import AppRoutes from "@routes/AppRoutes";
import SessionManager from "@components/auth/SessionManager";

function App() {
  return (
    <Router>
      <SessionManager>
        <Header />
        <div className="min-h-screen overflow-y-auto overflow-x-hidden">
          <AppRoutes />
        </div>
        <Footer />
      </SessionManager>
    </Router>
  );
}

export default App;
