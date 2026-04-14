const express = require("express");
const Task = require("../models/Task");

const router = express.Router();

// Create
router.post("/", async (req, res) => {
  try {
    const { title, status } = req.body ?? {};
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title is required" });
    }
    const doc = await Task.create({
      title: title.trim(),
      status: status ?? "pending",
    });
    return res.status(201).json(doc);
  } catch (err) {
    return res.status(500).json({ error: "failed to create task" });
  }
});

// Read all (optional filter via ?status=pending|completed)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query ?? {};
    const filter =
      status === "pending" || status === "completed" ? { status } : {};
    const docs = await Task.find(filter).sort({ createdAt: -1 });
    return res.json(docs);
  } catch (err) {
    return res.status(500).json({ error: "failed to fetch tasks" });
  }
});

// Update (title and/or status)
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body ?? {};

    const update = {};
    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return res.status(400).json({ error: "title must be a non-empty string" });
      }
      update.title = title.trim();
    }
    if (status !== undefined) {
      if (status !== "pending" && status !== "completed") {
        return res
          .status(400)
          .json({ error: "status must be pending or completed" });
      }
      update.status = status;
    }

    const doc = await Task.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ error: "task not found" });
    return res.json(doc);
  } catch (err) {
    return res.status(500).json({ error: "failed to update task" });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Task.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ error: "task not found" });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "failed to delete task" });
  }
});

module.exports = router;

