import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studyRoutes from "./routes/studyRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok", model: process.env.GROQ_MODEL || "openai/gpt-oss-120b" });
});

app.use("/api", studyRoutes);

// Central error handler — never let a raw stack trace leak to the client.
// Malformed request bodies (bad JSON, etc.) get their own 400 via
// body-parser's err.status; anything else is an unexpected 500.
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || err.statusCode;
  if (status === 400) {
    return res.status(400).json({ error: "Request body was not valid JSON." });
  }
  res.status(500).json({ error: "Something went wrong on our end. Please try again." });
});

app.listen(PORT, () => {
  console.log(`Study Assistant API running on port ${PORT}`);
});
