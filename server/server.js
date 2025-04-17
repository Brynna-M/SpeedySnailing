import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import snailRoutes from "./routes/snails.js";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/snails", snailRoutes);

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});