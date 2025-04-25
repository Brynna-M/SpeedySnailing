import dotenv from "dotenv";
dotenv.config();

import request from "supertest";
import express from "express";
import router from "./routes/snails.js"; // adjust the path as needed
import { createRandomSnail } from "./utils/createRandomSnail.js";
import { breedSnails } from "./utils/geneticAlgorithm.js";

const app = express();
app.use(express.json());
app.use("/snails", router);

describe("Speedy Snailing Backend Tests", () => {
  let createdSnailId;

  test("Seed endpoint should create a new snail", async () => {
    const response = await request(app).post("/snails/seed");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
    createdSnailId = response.body.id;
  });

  test("Get all snails", async () => {
    const response = await request(app).get("/snails");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Get a single snail by ID", async () => {
    if (!createdSnailId) return;
    const response = await request(app).get(`/snails/${createdSnailId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id", createdSnailId);
  });

  test("Breed two snails", async () => {
    const parent1 = await createRandomSnail();
    const parent2 = await createRandomSnail();
    const response = await request(app).post("/snails/breed").send({
      parent1Id: parent1.id,
      parent2Id: parent2.id,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("id");
  });

  test("Fetch snail image", async () => {
    if (!createdSnailId) return;
    const response = await request(app).get(`/snails/${createdSnailId}/image`);
    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toBe("image/png");
  });
});
