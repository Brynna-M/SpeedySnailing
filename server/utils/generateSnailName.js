import dotenv from "dotenv";
dotenv.config();
import { snailFirstNames, snailLastNames } from "./snailNames.js";

export function generateSnailName() {
  const first = snailFirstNames[Math.floor(Math.random() * snailFirstNames.length)];
  const last = snailLastNames[Math.floor(Math.random() * snailLastNames.length)];
  return `${first} ${last}`;
}