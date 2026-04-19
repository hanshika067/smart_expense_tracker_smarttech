import { Router } from "express";
import Expense from "../models/Expense.js";
import { authRequired } from "../middleware/auth.js";
import { classifyExpense } from "../services/mlClient.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res) => {
  const { from, to, category } = req.query;
  const q = { userId: req.userId };
  if (from || to) {
    q.date = {};
    if (from) q.date.$gte = new Date(from);
    if (to) q.date.$lte = new Date(to);
  }
  if (category) q.category = category;
  const items = await Expense.find(q).sort({ date: -1 }).limit(500).lean();
  res.json(items);
});

router.post("/", async (req, res) => {
  try {
    const { amount, category, date, description, useMl } = req.body || {};
    if (amount == null || Number(amount) < 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }
    let finalCategory = category;
    let classifiedByMl = false;
    const skipMl = useMl === false && category;
    if (!skipMl) {
      const ml = await classifyExpense(description || "");
      if (ml?.category) {
        finalCategory = ml.category;
        classifiedByMl = true;
      }
    }
    if (!finalCategory) {
      finalCategory = "Other";
    }
    const doc = await Expense.create({
      userId: req.userId,
      amount: Number(amount),
      category: finalCategory,
      date: date ? new Date(date) : new Date(),
      description: description || "",
      classifiedByMl,
    });
    res.status(201).json(doc);
  } catch (e) {
    res.status(400).json({ error: e.message || "Could not create expense" });
  }
});

router.patch("/:id", async (req, res) => {
  const { amount, category, date, description } = req.body || {};
  const doc = await Expense.findOne({ _id: req.params.id, userId: req.userId });
  if (!doc) return res.status(404).json({ error: "Not found" });
  if (amount != null) doc.amount = Number(amount);
  if (category) doc.category = category;
  if (date) doc.date = new Date(date);
  if (description != null) doc.description = description;
  doc.classifiedByMl = false;
  await doc.save();
  res.json(doc);
});

router.delete("/:id", async (req, res) => {
  const r = await Expense.deleteOne({ _id: req.params.id, userId: req.userId });
  if (r.deletedCount === 0) return res.status(404).json({ error: "Not found" });
  res.json({ ok: true });
});

export default router;
