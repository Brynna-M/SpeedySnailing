/**
 * Makes snails move semi-realistically
 */


import { useEffect, useState, useRef } from "react";
import getRandomPointInPolygon from "../utils/navigation.js";
import "./SnailMovement.css";

//hard-coded points on the screen for navigating
const polygonArea = [
  { x: 790, y: 400 },
  { x: 1300, y: 500 },
  { x: 1600, y: 850 },
  { x: 890, y: 1020 },
  { x: 450, y: 850 },
  { x: 300, y: 570 },
];

/**
 * component for individual snail movement
 * takes a snail and all of the current snail positions
 * and causes the snail to move
 * @param {*} param0 
 * @returns 
 */
export default function SnailMovement({ snail, allSnailPositions }) {
  //state for the current position which is a random point in the polygon
  const [pos, setPos] = useState(() => getRandomPointInPolygon(polygonArea));
  //takes the previous position to compare to determine movement direction
  const prev = useRef(pos);
  //if the snail should face left or not
  const [flipped, setFlipped] = useState(false);
  //if the snail is idling or not
  const [idle, setIdle] = useState(true);

  //runs everytime allSnailPosition changes
  useEffect(() => {
    //exits if theres something wrong with allSnailPositions
    if (!Array.isArray(allSnailPositions)) {
      console.warn("⚠ allSnailPositions is not a valid array:", allSnailPositions);
      return;
    }
 
    const move = () => {
      let attempt = 0;
      let next;
      //tries to get a position 10 times, a failed attempt is when a position is too close to another snail
      while (attempt < 10) {
        next = getRandomPointInPolygon(polygonArea);
        const tooClose = allSnailPositions.some(p => {
          //just incase null or undefined gets added to the list
          if (!p || typeof p.x !== "number" || typeof p.y !== "number") {
            console.warn("⚠ a position in snailPositions is not a valid number:", allSnailPositions);
            return false;
          }
          //calculating the distances
          const dx = p.x - next.x;
          const dy = p.y - next.y;
          return Math.hypot(dx, dy) < 100; //fails if the position is closer than 100 px
        });
        if (!tooClose) break;
        attempt++;
      }
      if (!next) return;

      //flips the snail in the right movement direction
      setFlipped(next.x > prev.current.x);
      setIdle(false);
      setPos(next);
      prev.current = next;

      setTimeout(() => setIdle(true), 3000);
    };

    //moves every 30-40 seconds
    const ms = 30000 + Math.random() * 10000;
    const id = setInterval(move, ms);
    return () => clearInterval(id);

  }, [allSnailPositions]);//reruns it if the positions change

  if (!snail || !snail.id || typeof snail.name !== "string") return null;

  const classList = ["snail"];
  if (flipped) classList.push("facing-left");
  if (idle) classList.push("idle");

  return (
    <img
      key={snail.id}
      src={`http://localhost:3000/snails/${snail.id}/image`}
      alt={snail.name}
      className={classList.join(" ")}
      style={{
        position: "absolute",
        top: `${pos.y}px`,
        left: `${pos.x}px`,
        width: "100px",
        zIndex: Math.floor(pos.y),
        transition: "top 3s ease, left 3s ease",
      }}
    />
  );
}