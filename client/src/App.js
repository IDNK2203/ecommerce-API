import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AuthRedir from "./components/AuthRedir";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={<AuthRedir type={"ap"} children={<Login />} />}
          />
          <Route
            path="/register"
            element={<AuthRedir type={"ap"} children={<Register />} />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
