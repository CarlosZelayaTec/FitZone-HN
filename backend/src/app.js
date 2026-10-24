const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/users.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "API FitZone-HN funcionando",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada",
  });
});

module.exports = app;
