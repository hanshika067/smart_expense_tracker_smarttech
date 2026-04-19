import { Router } from "express";
import Budget from "../models/Budget.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();
router.use(authRequired);

router.get("/", async (req, res) => {
  const b = await Budget.findOne({ userId: req.userId }).lean();
  res.json(b || null);
});

router.post("/", async (req, res) => {
  const { monthlyLimit, month, year } = req.body || {};
  if (monthlyLimit == null || Number(monthlyLimit) < 0) {
    return res.status(400).json({ error: "monthlyLimit required" });
  }
  const now = new Date();
  const doc = await Budget.findOneAndUpdate(
    { userId: req.userId },
    {
      monthlyLimit: Number(monthlyLimit),
      month: month ?? now.getMonth() + 1,
      year: year ?? now.getFullYear(),
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(doc);
});

export default router;
