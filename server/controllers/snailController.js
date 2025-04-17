import dotenv from "dotenv";
dotenv.config();
import { getSnailWithTraits } from "../db/queries.js";
import supabase from "../config/supabaseClient.js";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export async function getSnail(req, res) {
  const { id } = req.params;
  try {
    const snail = await getSnailWithTraits(id);
    if (!snail) return res.status(404).json({ error: "Snail not found" });
    res.json(snail);
  } catch (err) {
    console.error("🐛 Failed to get snail:", err);
    res.status(500).json({ error: "Failed to get snail" });
  }
}

export async function getAllSnails(req, res) {
  try {
    const { data, error } = await supabase.from("snails").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("🐛 Failed to fetch all snails:", err);
    res.status(500).json({ error: "Failed to fetch snails" });
  }
}

export async function getSnailImage(req, res) {
  const id = req.params.id;
  console.log("🐌 GET /snails/:id/image received");

  try {
    const snail = await getSnailWithTraits(id);
    console.log("🐌 Retrieved snail with traits:", snail);

    if (!snail) {
      return res.status(404).json({ error: "Snail not found" });
    }

    const basePath = path.join(__dirname, "../assets");

    const layers = [
      snail.shell_color_path && path.join(basePath, snail.shell_color_path),
      snail.body_color_path && path.join(basePath, snail.body_color_path),
      snail.shading_path && path.join(basePath, snail.shading_path),
      snail.body_outline_path && path.join(basePath, snail.body_outline_path),
      snail.shell_outline_path && path.join(basePath, snail.shell_outline_path),
      snail.mouth_path && path.join(basePath, snail.mouth_path),
      snail.eyes_pupil_path && path.join(basePath, snail.eyes_pupil_path),
      snail.shell_acc_path && path.join(basePath, snail.shell_acc_path),
      snail.eyes_acc_path && path.join(basePath, snail.eyes_acc_path),
      snail.acc_path && path.join(basePath, snail.acc_path),
    ].filter(Boolean);

    console.log("🧩 Image layers:", layers);

    const baseImage = await sharp(await fs.readFile(layers[0]));

    const composites = await Promise.all(
      layers.slice(1).map(async (layerPath) => {
        const input = await fs.readFile(layerPath);
        const isShadingLayer = layerPath.includes("shading");
        return {
          input,
          blend: isShadingLayer ? "overlay" : "over",
        };
      })
    );

    const final = await baseImage.composite(composites).png().toBuffer();

    res.set("Content-Type", "image/png");
    res.send(final);
  } catch (err) {
    console.error("🐛 Image generation error or trait fetch error:", err);
    res.status(500).json({ error: "Failed to render snail image" });
  }
}
