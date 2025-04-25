import dotenv from "dotenv";
dotenv.config();
import { getSnailWithTraits } from "../db/queries.js";
import supabase from "../config/supabaseClient.js";
import path from "path";
import sharp from "sharp";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


// In-memory cache to avoid regenerating images repeatedly
const imageCache = new Map();

export async function getSnail(req, res) {
  const { id } = req.params;
  try {
    const snail = await getSnailWithTraits(id);
    if (!snail) return res.status(404).json({ error: "Snail not found" });
    res.json(snail);
  } catch (err) {
    console.error("⚠️🐌 Failed to get snail:", err);
    res.status(500).json({ error: "Failed to get snail" });
  }
}

export async function getAllSnails(req, res) {
  try {
    const { data, error } = await supabase.from("snails").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("⚠️🐌🐌 Failed to fetch all snails:", err);
    res.status(500).json({ error: "Failed to fetch snails" });
  }
}


export async function getSnailImage(req, res) {
  const id = req.params.id;
  console.log("🐌🖼 GET /snails/:id/image received");

  //validating the id is a number so we can cache the image with this key
  if (!/^[0-9]+$/.test(id)) {
    return res.status(400).json({ error: "Invalid snail ID" });
  }

  //checking cache for existing image
  const cacheKey = `snail:${id}`;
  if (imageCache.has(cacheKey)) {
    console.log("🐌🖼📦 Serving cached image");
    res.set("Content-Type", "image/png");
    return res.send(imageCache.get(cacheKey));
  }

  //getting the image if not already cached
  try {
    const snail = await getSnailWithTraits(id);
    console.log("🐌🔎 Retrieved snail with traits:", snail);

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

    console.log("🐌🖼🧩 Image layers:", layers);

    //making sure only known files are accessed to increase the security of the app
    for (const filePath of layers) {
      if (!filePath.startsWith(basePath)) {
        console.warn("⚠️ Path traversal attempt detected:", filePath);
        return res.status(400).json({ error: "Invalid image layer path" });
      }
    }

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

    const final = await baseImage.composite(composites).png({ compressionLevel: 9 }).toBuffer();

    //caching the generated image to improve performance
    imageCache.set(cacheKey, final);

    res.set("Content-Type", "image/png");
    res.send(final);
  } catch (err) {
    console.error("⚠️🐌🖼 Image generation error:", err);
    // we're avoiding exposing stack traces to the client to improve security here
    res.status(500).json({ error: "Failed to render snail image" });
  }
}