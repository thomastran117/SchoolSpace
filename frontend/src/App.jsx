import Navbar from "./components/Navbar"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
function App() {

    const handleAuth = async (mode, { name, email, password }) => {
    // mode: "login" | "signup"
    // TODO: call your API, e.g. via fetch/axios
    // throw new Error("Bad credentials") to see error UI
  };

  return (
    <Router>
      <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage onAuth={handleAuth}/>} />
        </Routes>
    </Router>
  )
}

export default App
