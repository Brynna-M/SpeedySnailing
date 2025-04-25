import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;



console.log("Connecting to:", process.env.SUPABASE_URL);


const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
