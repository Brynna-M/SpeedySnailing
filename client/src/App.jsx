import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Habitat from "./pages/Habitat";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Habitat />} />

      </Routes>
    </Router>
  );
}

export default App;
