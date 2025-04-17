import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [snails, setSnails] = useState([]);
  const [parent1, setParent1] = useState("");
  const [parent2, setParent2] = useState("");

  useEffect(() => {
    fetchSnails();
  }, []);

  const fetchSnails = async () => {
    try {
      const res = await fetch("http://localhost:3000/snails");
      const data = await res.json();
      setSnails(data);
    } catch (err) {
      console.error("Error fetching snails:", err);
    }
  };

  const handleHunt = async () => {
    try {
      await fetch("http://localhost:3000/snails/seed", { method: "POST" });
      fetchSnails();
    } catch (err) {
      console.error("Error seeding snail:", err);
    }
  };

  const handleBreed = async () => {
    if (!parent1 || !parent2 || parent1 === parent2) return alert("Pick two different snails!");
    try {
      await fetch("http://localhost:3000/snails/breed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parent1Id: Number(parent1), parent2Id: Number(parent2) }),
      });
      fetchSnails();
    } catch (err) {
      console.error("Error breeding snail:", err);
    }
  };

  return (
    <div className="App">
      <button className="hunt-button" onClick={handleHunt}>🐌 Hunt</button>

      <div className="breeding-box">
        <h3>Breed Snails</h3>
        <select value={parent1} onChange={(e) => setParent1(e.target.value)}>
          <option value="">Select Parent 1</option>
          {snails.map((snail) => (
            <option key={snail.id} value={snail.id}>{snail.name}</option>
          ))}
        </select>
        <select value={parent2} onChange={(e) => setParent2(e.target.value)}>
          <option value="">Select Parent 2</option>
          {snails.map((snail) => (
            <option key={snail.id} value={snail.id}>{snail.name}</option>
          ))}
        </select>
        <button onClick={handleBreed}>💞 Breed</button>
      </div>

      <div className="habitat">
        {snails.map((snail) => (
          <img
            key={snail.id}
            src={`http://localhost:3000/snails/${snail.id}/image`}
            alt={snail.name}
            className="snail"
            style={{
              top: `${Math.random() * 90}%`,
              left: `${Math.random() * 90}%`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default App;