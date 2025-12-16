import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/main/HomePage";

function App() {
  return (
    <Router>
      <div className="min-h-screen overflow-y-auto overflow-x-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
