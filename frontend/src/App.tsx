import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/shared/Navbar";
import HomePage from "./pages/main/HomePage";

function App() {
  return (
    <Router>
      <Navbar />
        <div className="min-h-screen overflow-y-auto overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
