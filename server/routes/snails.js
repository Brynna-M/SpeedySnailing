import dotenv from "dotenv";
dotenv.config();
import express from "express";
import {
  getSnail,
  getAllSnails,
  getSnailImage
} from "../controllers/snailController.js";
import { createRandomSnail } from "../utils/createRandomSnail.js";
import { breedSnails } from "../utils/geneticAlgorithm.js";

const router = express.Router();

router.post("/seed", async (req, res) => {
  console.log("🌱 POST /snails/seed received");
  try {
    const snail = await createRandomSnail();
    res.json(snail);
  } catch (err) {
    res.status(500).json({ error: "Failed to seed snail" });
  }
});

router.post("/breed", async (req, res) => {
  const { parent1Id, parent2Id } = req.body;
  console.log(`🧬 POST /snails/breed with parents ${parent1Id} + ${parent2Id}`);
  try {
    const child = await breedSnails(parent1Id, parent2Id);
    res.json(child);
  } catch (err) {
    res.status(500).json({ error: "Failed to breed snails" });
  }
});

router.get("/:id/image", getSnailImage);
router.get("/:id", getSnail);
router.get("/", getAllSnails);

export default router;
