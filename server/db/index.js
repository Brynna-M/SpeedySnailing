import dotenv from "dotenv";
dotenv.config();
import pkg from "pg";
const { Pool } = pkg;



console.log("Connecting to:", process.env.SUPABASE_URL);


const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: { rejectUnauthorized: false },
  },
);

export default pool;
