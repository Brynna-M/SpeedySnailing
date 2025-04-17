import dotenv from "dotenv";
dotenv.config();
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.VITE_SUPABASE_URL,
  ssl: { rejectUnauthorized: false } //supabase requires this
});

async function testDB() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected to Supabase DB");
    console.log("🕓 Current DB Time:", result.rows[0].now);
  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err);
  } finally {
    await pool.end();
  }
}

testDB();

console.log("🔍 DATABASE_URL =", process.env.VITE_SUPABASE_URL);
