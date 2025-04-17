import express from "express";
import cors from "cors";
import snailRoutes from "./routes/snails.js";

const app = express();

app.use(cors()); // ← Enable CORS
app.use(express.json());
app.use("/snails", snailRoutes);

export default app;