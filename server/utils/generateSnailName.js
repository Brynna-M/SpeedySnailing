/**
 * small utility to build randomly generated names
 */
import dotenv from "dotenv";
dotenv.config();
import { snailFirstNames, snailLastNames } from "./snailNames.js";

export function generateSnailName() {
  let first;
  let last;
  if (!Array.isArray(snailFirstNames) || snailFirstNames.length === 0) {
    console.warn("snailFirstNames is missing or empty. Defaulting to 'Bill'.");
    first = "Bill";
  }else{
    first = snailFirstNames[Math.floor(Math.random() * snailFirstNames.length)];
  }
  if (!Array.isArray(snailLastNames) || snailLastNames.length === 0) {
    console.warn("snailLastNames is missing or empty. Defaulting to 'Sir Slimesworth'.");
    last ="Sir Slimesworth";
  }else{
    last = snailLastNames[Math.floor(Math.random() * snailLastNames.length)];
  }
  return `${first} ${last}`;
}