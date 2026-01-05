import "dotenv/config.js";
import express from "express";
import logger from "morgan";
import organRouter from "./routes/organRoutes.js";
import aiRouter from "./routes/aiRoutes.js";
import cors from "cors";

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(
  cors({
    
    origin: "https://biolens-dashboard.vercel.app", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, 
  })
);

app.use(express.static('public'));
app.use("/api", organRouter);
app.use("/api", aiRouter);

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the AR Organ API!" });
});

// Ini akan nangkep semua request yang nggak cocok sama route di atas
app.use((req, res, next) => {
  res.status(404).json({
    message: "Endpoint not found",
    method: req.method,
    url: req.originalUrl,
  });
});


// 2. JSON 500 Error Handler (kalo ada error di server)
// Ini akan nangkep error dari controller, dll.
app.use((err, req, res, next) => {
  // Log error-nya ke console biar tau
  console.error(err.stack);

  // Kirim respon error 500 sebagai JSON
  res.status(err.status || 500).json({
    message: "Terjadi error di server",
    error: err.message,
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server jalan di http://localhost:${PORT}`);
});

export default app;
