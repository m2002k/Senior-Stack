import Login from './pages/Login'
import Dashboard from "./pages/Dashboard";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Register from './pages/Register';
import VerifyPending from "./pages/VerifyPending";


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<VerifyPending />} />
      <Route path="/dashboard" element={ <PrivateRoute> <Dashboard /> </PrivateRoute>} />
    </Routes>
  );
}

export default App;
