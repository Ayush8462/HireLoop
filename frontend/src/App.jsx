import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage"
import Signup from "./pages/auth/signup"
import Login from "./pages/auth/login"
import Dashboard from "./pages/dashboard/dashboard"
function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
