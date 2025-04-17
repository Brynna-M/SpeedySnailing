import dotenv from "dotenv";
dotenv.config();
import supabase from "../config/supabaseClient.js";
import { getRandomSnailName } from "./snailNames.js";

async function getRandomTraitId(traitType, parentTraitId = null) {
  try {
    console.log(
      `🔍 Selecting [${traitType}]${parentTraitId ? ` with parent ID: ${parentTraitId}` : " (no parent)"}`
    );

    let query = supabase.from("traits").select("id, name, rarity").eq("trait_type", traitType);
    if (parentTraitId !== null) {
      query = query.eq("parent_trait_id", parentTraitId);
    }

    const { data, error } = await query;
    if (error) throw error;
    if (!data.length) throw new Error(`No traits found for type: ${traitType}`);

    const weighted = [];
    for (let trait of data) {
      const weight = [75, 15, 6, 3, 1][trait.rarity - 1] || 1;
      for (let i = 0; i < weight; i++) weighted.push(trait);
    }

    const picked = weighted[Math.floor(Math.random() * weighted.length)];
    console.log(`✅ Picked trait: [${traitType}] → ${picked.name} (ID ${picked.id})`);
    return picked.id;
  } catch (err) {
    console.error(`🚨 Error in getRandomTraitId for [${traitType}]`, err);
    throw err;
  }
}

export async function createRandomSnail(name = getRandomSnailName()) {
  console.log(`🐣 Starting to create snail: ${name}`);
  const traitMap = {};

  try {
    traitMap["shell_outline"] = await getRandomTraitId("shell_outline");
    traitMap["shell_color"] = await getRandomTraitId("shell_color", traitMap["shell_outline"]);
    traitMap["shell_shading"] = await getRandomTraitId("shell_shading", traitMap["shell_outline"]);

    const traitTypes = [
      "body_color",
  "body_outline",
  "mouth",
  "eyes_pupil",
  "eyes_acc",
  "shell_acc",
  "acc"
];

    for (let type of traitTypes) {
      traitMap[type] = await getRandomTraitId(type);
    }

    const stats = {
      speed: Number((Math.random() * 5).toFixed(2)),
      slimeiness: Number((Math.random() * 10).toFixed(2)),
      charisma: Number((Math.random() * 10).toFixed(2)),
    };

    const genes = {
      mutation_rate_modifier: Number((1 + (Math.random() * 0.3 - 0.15)).toFixed(2)),
      glows_in_the_dark: Math.random() < 0.1,
      hoarder: Math.random() < 0.25,
      aggression: Number((Math.random()).toFixed(2)),
    };

    const { data, error } = await supabase
      .from("snails")
      .insert([
        {
          name,
          body_color_id: traitMap["body_color"],
          shell_color_id: traitMap["shell_color"],
          body_outline_id: traitMap["body_outline"], 
          shell_shading_id: traitMap["shell_shading"],
          shell_acc_id: traitMap["shell_acc"],
          shell_outline_id: traitMap["shell_outline"],
          eyes_pupil_id: traitMap["eyes_pupil"],
          eyes_acc_id: traitMap["eyes_acc"],
          mouth_id: traitMap["mouth"],
          acc_id: traitMap["acc"],
          speed: stats.speed,
          slimeiness: stats.slimeiness,
          charisma: stats.charisma,
          genetic_traits: genes,
          generation: 1,
        },
      ])
      .select();

    if (error) throw error;
    console.log(`✅ Snail inserted: ${data[0].name} (ID ${data[0].id})`);
    return data[0];
  } catch (err) {
    console.error("🐛 Failed to create random snail:", err);
    throw err;
  }
}
