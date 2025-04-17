import dotenv from "dotenv";
dotenv.config();
import supabase from "../config/supabaseClient.js";
import { getSnailById } from "../db/queries.js";

async function weightedTraitInheritance(p1Id, p2Id, traitType, forceMutation = false) {
  const { data: traits, error } = await supabase
    .from("traits")
    .select("id, rarity")
    .eq("trait_type", traitType);

  if (error) throw error;

  const inherited = [p1Id, p2Id];

  if (!forceMutation && Math.random() > 0.05) {
    // 95% chance to inherit directly
    return inherited[Math.floor(Math.random() * 2)];
  }

  // Mutation path
  const weight = (rarity) => 6 - rarity;
  const options = [];
  for (const trait of traits) {
    const traitWeight = weight(trait.rarity);
    for (let i = 0; i < traitWeight; i++) {
      options.push(trait.id);
    }
  }

  let mutated;
  do {
    mutated = options[Math.floor(Math.random() * options.length)];
  } while (inherited.includes(mutated));

  return mutated;
}

export async function breedSnails(parent1Id, parent2Id) {
  const [p1, p2] = await Promise.all([
    getSnailById(parent1Id),
    getSnailById(parent2Id),
  ]);

  if (!p1 || !p2) throw new Error("One or both parents not found");

  const generation = Math.max(p1.generation ?? 1, p2.generation ?? 1) + 1;

  const allowMutation = Math.random() < 0.3;
  const traitKeys = [
    "body_color_id",
    "body_outline_id",
    "mouth_id",
    "eyes_pupil_id",
    "eyes_acc_id",
    "shell_acc_id",
    "acc_id",
    "shell_outline_id" // Include shell_outline_id in the loop
  ];

  const mutationIndex = allowMutation
    ? Math.floor(Math.random() * traitKeys.length)
    : -1;

  const childTraits = {};

  for (let i = 0; i < traitKeys.length; i++) {
    const trait = traitKeys[i];
    const traitType = trait.replace("_id", "");

    if (trait === "shell_outline_id") {
      if (i === mutationIndex) {
        const { data: all, error } = await supabase
          .from("traits")
          .select("id")
          .eq("trait_type", "shell_outline");

        if (error) throw error;

        const nonParentTraits = all.filter(
          (t) => t.id !== p1.shell_outline_id && t.id !== p2.shell_outline_id
        );

        const randomTrait =
          nonParentTraits[Math.floor(Math.random() * nonParentTraits.length)];
        childTraits[trait] = randomTrait.id;
        console.log(`⚠️ MUTATION occurred on shell_outline: trait ${randomTrait.id}`);
      } else {
        const inherited = await weightedTraitInheritance(
          p1.shell_outline_id,
          p2.shell_outline_id,
          "shell_outline"
        );
        childTraits[trait] = inherited;
      }
    } else if (i === mutationIndex) {
      const { data: all, error } = await supabase
        .from("traits")
        .select("id")
        .eq("trait_type", traitType);

      if (error) throw error;

      const nonParentTraits = all.filter(
        (t) => t.id !== p1[trait] && t.id !== p2[trait]
      );

      if (!nonParentTraits.length) {
        childTraits[trait] = p1[trait];
      } else {
        const randomTrait =
          nonParentTraits[Math.floor(Math.random() * nonParentTraits.length)];
        childTraits[trait] = randomTrait.id;
        console.log(`⚠️ MUTATION occurred on ${traitType}: trait ${randomTrait.id}`);
      }
    } else {
      const inherited = await weightedTraitInheritance(p1[trait], p2[trait], traitType);
      childTraits[trait] = inherited;
    }
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

  const speed = inheritStat(p1.speed, p2.speed);
  const slimeiness = inheritStat(p1.slimeiness, p2.slimeiness);
  const charisma = inheritStat(p1.charisma, p2.charisma);

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
      },
    ])
    .select();

  if (error) throw error;
  return data[0];
}
