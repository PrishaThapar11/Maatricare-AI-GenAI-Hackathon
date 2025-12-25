import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RiskExplanation from "./pages/RiskExplanation";
import CarePlan from "./pages/CarePlan";
import Escalation from "./pages/Escalation";




function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/patient/:id/risk" element={<RiskExplanation />} />
          <Route path="/patient/:id/care" element={<CarePlan />} />
          <Route path="/patient/:id/escalation" element={<Escalation />} />
          
         



        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;





