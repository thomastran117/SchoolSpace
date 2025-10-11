import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import routes from "./routes";
import SessionManager from "./components/auth/SessionManager";

function App() {
  return (
    <Router>
      <SessionManager>
        <Navbar />
        <Routes>
          {routes.map(({ path, element }) => (
            <Route key={path} path={path} element={element} />
          ))}
        </Routes>
        <Footer />
      </SessionManager>
    </Router>
  );
}

export default App;
