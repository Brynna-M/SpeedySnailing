

import {useEffect, useState} from "react";
import "./Habitat.css";
import SnailMovement from "../components/SnailMovement";

function App() {

    //state
    const [snails, setSnails] = useState([]);
    const [parent1, setParent1] = useState([]);
    const [parent2, setParent2] = useState([]);
    const [positions, setPositions]= useState({});

    //fetching snails on mount
    useEffect(()=>{
        fetchSnails();
    }, []);

    //retrieves all the snails from the backend
    const fetchSnails = async () => {
        try {
            const response =await fetch("http://localhost:3000/snails");
            const data = await response.json();
            setSnails(data);
        } catch (err){
            console.error("Error fetching snails:", err)
        }
    }
    //reference dots for the nav polygon for debugging
    const NAV_DOTS = [
        {top: "400px", left: "790px"},
        {top: "500px", left: "1300px"},
        {top: "570px", left: "300px"},
        {top: "850px", left: "450px"},
        {top: "1020px", left: "890px"},
        {top: "850px", left: "1600px"}
    ]
    //dropdown for snail selection by id
    function SnailSelect ({label, value, onChange, snail}){
        return(
            <select value={value} onChange={onChange}>
                <option value="">{label}</option>
                {snails.map((snail)=> (
                    <option key={snail.id} value={snail.id}>{snail.name}</option>
                ))}
            </select>
        );
    }
    //POST sending a request to "hunt" or generate a new random snail
    const handleHunt = async () => {
        try {
            await fetch("http://localhost:3000/snails/seed", {method: "POST"});
            fetchSnails();
        }catch (err){
            console.error("Error seeding snail:", err);
        }
    };


    //POST sending a request to "breed" two snails or create a child from two snails
    const handleBreed = async () => {
        if(!parent1 || !parent2 || parent1 === parent2){
            return alert("Pick two different snails!");
        }
        try {
            const response = await fetch("http://localhost:3000/snails/seed", {
                method: "POST",
                headers: {"Content-Type":"application/json"},
                body: JSON.stringify({parentId: Number(parent1), parent2Id: Number(parent2)}),
            });
            const data = await response.json();
            if (!response.ok){
                alert(data.error || "Breeding failed. Try a different pair.");
                return;
            }
            fetchSnails();
        } catch (err) {
            console.error("Error breeding snail:", err);
            alert("Breeding failed. The snails may not be compatible or something went wrong.");
        }
    };
    //jsx redering
    return (
        <div className="habitat-container">
            {NAV_DOTS.map((dot,i)=>(
                <div key ={i} className="red-dot" style={dot}></div>

            ))}
            <header className="header">
                <h1>Speedy Snailing Habitat</h1>
                <div className="controls">
                    <button className="hunt-button" onClick={handleHunt}>Hunt</button>
                    <div>
                        <button className="breed-button" onClick={handleBreed}>Breed</button>
                        <SnailSelect label="Select Parent 1" value={parent1} onChange={(e)=>setParent1(e.target.value)} snails={snails}/>
                        <SnailSelect label="Select Parent 2" value={parent2} onChange={(e)=>setParent2(e.target.value)} snails={snails}/>
                    </div>
                </div>
            </header>
            <div className="habitat">
                {snails.map((snail, i) =>
                    <SnailMovement
                    key = {snail.id}
                    snail={snail}
                    allSnailPositions={snails.map((s,j) => s.position || {x: 0, y:0})}/>
                )}
                
            </div>
        </div>
    );
}
export default App;