import dotenv from "dotenv";
dotenv.config();
import supabase from "../config/supabaseClient.js";


export async function getSnailById(id) {
    console.log(`🔍 Fetching snail with ID: ${id}`);
    try {
      const { data, error } = await supabase
        .from("snails")
        .select("*")
        .eq("id", id)
        .single();
  
      if (error) throw error;
      return data;
    } catch (err) {
      console.error("❌ Error in getSnailById:", err);
      throw err;
    }
  }

  export async function getSnailWithTraits(id) {
    try {
      console.log("🔍 Running trait query for snail ID:", id);
  
      const { data, error } = await supabase
        .from("snails_with_traits") // 👈 a Supabase view you should create
        .select("*")
        .eq("id", id)
        .single();
  
      if (error) throw error;
      console.log("✅ Trait query complete");
      return data;
    } catch (err) {
      console.error("❌ Failed to query snail traits:", err);
      throw err;
    }
}