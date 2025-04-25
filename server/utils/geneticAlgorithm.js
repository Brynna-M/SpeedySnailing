import dotenv from "dotenv";
dotenv.config();
import supabase from "../config/supabaseClient.js";
import { getSnailById } from "../db/queries.js";

/**
 * Function to generate a trait from a specified trait group 
 * based on the two parents, the generation of the snail, 
 * and the lineage of the snail. There is a small chance of 
 * mutation dependent on generation.
 * @param {*} p1Id ID of parent 1
 * @param {*} p2Id ID of parent 2
 * @param {*} traitType Trait to be inherited 
 * @param {*} generation generation #
 * @param {*} forceMutation forces the mutaiton of a trait
 * @returns 
 */

async function weightedTraitInheritance(p1Id, p2Id, traitType, generation, forceMutation = false) {
   //selecting id and rarity fields of a specific trait type from the trait table
  const { data: traits, error } = await supabase
    .from("traits")
    .select("id, rarity")
    .eq("trait_type", traitType);

  if (error) throw error;

  const inherited = [p1Id, p2Id];

  //inheriting directly (weighted based on generation number, capped at 33% chance of mutation)
  const mutationChance = Math.min(0.05 * (generation / 8), 0.33);
  const shouldMutate = forceMutation || Math.random() < mutationChance;

  //inherit directly (no mutation)
  if (!shouldMutate) {
    return inherited[Math.floor(Math.random() * inherited.length)];
  }

  //prevent edge case: too few traits to mutate (causes infinite loop)
  if (traits.length <= 2) {
    return inherited[Math.floor(Math.random() * inherited.length)];
  }

  //filtering out parent traits so mutation is actually different
  const nonParentTraits = traits.filter(t => !inherited.includes(t.id));

  //if no valid mutation options remain we fallback to inheriting traits
  if (nonParentTraits.length === 0) {
    return inherited[Math.floor(Math.random() * inherited.length)];
  }


  //choosing the mutated trait based on how rare the trait is
  //custom rarity weights [1 = common, 5 = rare]
  const rarityWeights = [75, 15, 6, 3, 1];
  const weightedPool = [];
  //goes through the list of traits and adds the current trait to the list a number of times based on the weight
  for (const trait of nonParentTraits) {
    const weight = rarityWeights[trait.rarity - 1] || 1;
    for (let i = 0; i < weight; i++) {
      weightedPool.push(trait.id);
    }
  }

  //picking from weighted pool
  const mutated = weightedPool[Math.floor(Math.random() * weightedPool.length)];
  return mutated;
}


/**
 * Function to handle breeding two snails together where success is based on
 * charisma scores and the quality of stats is reduced with inbreeding.
 * @param {*} parent1Id ID of parent 1
 * @param {*} parent2Id ID of parent 2
 * @param {*} maxMutationsPerBreeding the maximum amount of mutations allowed
 * @returns 
 */
export async function breedSnails(parent1Id, parent2Id, maxMutationsPerBreeding = 1) {
  //retrieving parent data from the database
  const [p1, p2] = await Promise.all([
    getSnailById(parent1Id),
    getSnailById(parent2Id),
  ]);

  if (!p1 || !p2) throw new Error("One or both parents not found");

  //charisma compatibility check
  //uses the average charisma score of the two snails (set to 5 if undefined)
  const avgCharisma = ((p1.charisma ?? 5) + (p2.charisma ?? 5)) / 2;
  //randomly generates a threshold (0-6)
  const compatibilityThreshold = Math.random() * 9;

  //compares the threshold to the average, if the average is less than the threshold the check fails
  if (avgCharisma < compatibilityThreshold) {
    console.log(`charisma check failed`)
    return res.status(400).json({
      error: "These snails don't like each other very much right now. Try again or maybe pick a more charismatic pairing.",
    });
  }
  
  //finding the lineage for tracking and figuring out inbreeding level
  const parent1Lineage = p1.lineage ?? [p1.id];
  const parent2Lineage = p2.lineage ?? [p2.id];
  const combinedLineage = [...new Set([p1.id, ...parent1Lineage, p2.id, ...parent2Lineage])];
  //finding generation (will make mutations more likely)
  const generation = Math.max(p1.generation ?? 1, p2.generation ?? 1) + 1;

  const traitKeys = [
    "body_color_id",
    "body_outline_id",
    "mouth_id",
    "eyes_pupil_id",
    "eyes_acc_id",
    "shell_acc_id",
    "acc_id",
    "shell_outline_id" 
  ];

  //tracking mutations
  let mutationsUsed = 0;

  const childTraits = {};

  for (let i = 0; i < traitKeys.length; i++) {
    //helps with table compatibility in the database
    const trait = traitKeys[i];
    const traitType = trait.replace("_id", "");

    //checks to see if we can and will mutate this trait
    const allowMutation =.3;
    const shouldMutate = allowMutation && mutationsUsed < maxMutationsPerBreeding;
      const inherited = await weightedTraitInheritance(p1[trait], p2[trait], traitType, generation);
      childTraits[trait] = inherited;
  }

  // Dependent shell traits
  const { data: colors } = await supabase
    .from("traits")
    .select("id")
    .eq("trait_type", "shell_color")
    .eq("parent_trait_id", childTraits.shell_outline_id);

  childTraits.shell_color_id = colors[Math.floor(Math.random() * colors.length)].id;

  const { data: shadings } = await supabase
    .from("traits")
    .select("id")
    .eq("trait_type", "shell_shading")
    .eq("parent_trait_id", childTraits.shell_outline_id);

  childTraits.shell_shading_id = shadings[Math.floor(Math.random() * shadings.length)].id;

  const inheritStat = (a, b, variance = 1) =>
    Math.max(0, ((a + b) / 2 + (Math.random() * variance * 2 - variance)).toFixed(2));

  const sharedAncestors = parent1Lineage.filter(id => parent2Lineage.includes(id));

//avoid dividing by 0 and calculate overlap percentage
const totalUniqueAncestors = new Set([...parent1Lineage, ...parent2Lineage]).size;

let commonAncestryLevel = 0;
if (sharedAncestors.length > 0 && totalUniqueAncestors > 0) {
  commonAncestryLevel = sharedAncestors.length / totalUniqueAncestors;
}

//invert for a penalty: 1 means unrelated, 0 means fully shared ancestry
const diversityBonus = Math.max(0, 1 - commonAncestryLevel);

// Apply this multiplier to penalize inherited stats
const speed = inheritStat(p1.speed, p2.speed) * diversityBonus;
const slimeiness = inheritStat(p1.slimeiness, p2.slimeiness) * diversityBonus;
const charisma = inheritStat(p1.charisma, p2.charisma) * diversityBonus;

console.log(`🌿 Common ancestry level: ${commonAncestryLevel.toFixed(2)} → diversity bonus: ${diversityBonus.toFixed(2)}`);

  const p1Genes = p1.genetic_traits || {};
  const p2Genes = p2.genetic_traits || {};

  const childGenes = {
    aggression: inheritStat(p1Genes.aggression ?? 0.5, p2Genes.aggression ?? 0.5, 0.2),
    mutation_rate_modifier: inheritStat(p1Genes.mutation_rate_modifier ?? 1.0, p2Genes.mutation_rate_modifier ?? 1.0, 0.05),
    hoarder: Math.random() < 0.5 ? p1Genes.hoarder ?? false : p2Genes.hoarder ?? false,
    glows_in_the_dark: Math.random() < 0.01,
  };

  const { data, error } = await supabase
    .from("snails")
    .insert([
      {
        name: `Child of ${p1.name} + ${p2.name}`,
        ...childTraits,
        speed,
        slimeiness,
        charisma,
        genetic_traits: childGenes,
        parent1_id: parent1Id,
        parent2_id: parent2Id,
        generation,
        lineage: combinedLineage,
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}
