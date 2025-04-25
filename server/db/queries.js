import dotenv from "dotenv";
dotenv.config();
import supabase from "../config/supabaseClient.js";


export async function getSnailById(id) {
    if (!id || typeof id !== "string") {
      console.warn("❌🐌 [getSnailById] Invalid ID format:", id);
      throw new Error("Invalid ID format");
    }
    console.log(`🐌🔍 [getSnailById] Fetching snail with ID: ${id}`);

    try {
      const { data, error } = await supabase
        .from("snails")
        .select("*")
        .eq("id", id)
        .single();
  
      if (error) {
        console.warn(`❌🐌 [getSnailById] Supabase error:`, error.message);
        throw new Error("Database error fetching snail");
      }    
      if (!data) {
        console.info(`❌🐌[getSnailById] No snail found with ID: ${id}`);
        return null;
      }
      console.log(`🐌[getSnailById] Snail retrieved successfully`);
      return data;
    } catch (err) {
      console.error("❌🐌 Unexpected Error in getSnailById:", err);
      throw err;
    }
  }

  export async function getSnailWithTraits(id) {
    if (!id || typeof id !== "string") {
      console.warn("❌🐌[getSnailWithTraits] Invalid ID format:", id);
      throw new Error("Invalid ID format");
    }
    console.log(`🐌🔍[getSnailWithTraits] Trait lookup for snail ID: ${id}`);
    try {  
      const { data, error } = await supabase
        .from("snails_with_traits") 
        .select("*")
        .eq("id", id)
        .single();
  
      if (error) {
        console.warn(`❌🐌[getSnailWithTraits] Supabase error:`, error.message);
        throw new Error("Database error fetching snail traits");
      }
  
      if (!data) {
        console.info(`❌🐌[getSnailWithTraits] No traits found for snail ID: ${id}`);
        return null;
      }
      console.log(`✅🐌[getSnailWithTraits] Trait data retrieved successfully`);
      return data;
    } catch (err) {
      console.error(`❌🐌[getSnailWithTraits] Unexpected error:`, err);
      throw err;
    }
}