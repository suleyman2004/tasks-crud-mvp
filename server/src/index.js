const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

const tasksRouter = require("./routes/tasks");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/tasks", tasksRouter);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // eslint-disable-next-line no-console
  console.error("Missing MONGODB_URI. Copy .env.example to .env and set it.");
  process.exit(1);
}

// Some Windows setups point Node DNS to 127.0.0.1 (local DNS proxy),
// which can fail SRV lookups required by mongodb+srv:// connection strings.
try {
  const servers = dns.getServers();
  if (servers.length === 1 && servers[0] === "127.0.0.1") {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
  }
} catch (_e) {
  // ignore
}

mongoose
  .connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`API listening on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

