import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import studyRoutes from "./routes/studyRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigin = process.env.FRONTEND_URL;

app.use(
  cors({
    origin: allowedOrigin || true,
    credentials: false,
  })
);

app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
  });
});

// API routes
app.use("/api", studyRoutes);

// Helpful API check
app.get("/api", (req, res) => {
  res.json({
    status: "ok",
    message: "Study Assistant API is running",
    endpoints: [
      "POST /api/generate-flashcards",
      "POST /api/evaluate-answer",
    ],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  const status = err.status || err.statusCode;

  if (status === 400) {
    return res.status(400).json({
      error: "Request body was not valid JSON.",
    });
  }

  res.status(500).json({
    error: "Something went wrong on our end. Please try again.",
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Study Assistant API running on port ${PORT}`);
});