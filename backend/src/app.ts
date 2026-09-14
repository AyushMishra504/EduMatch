import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { healthRouter } from "./routes/health.js";

export const app = express();

app.use(cors({ origin: env.FRONTEND_URL }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/health", healthRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});