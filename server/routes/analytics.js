import { Router } from "express";
import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import { authRequired } from "../middleware/auth.js";
import { predictSpending } from "../services/mlClient.js";
import { buildInsights } from "../services/insights.js";

const router = Router();
router.use(authRequired);

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfPrevMonth(d) {
  return new Date(d.getFullYear(), d.getMonth() - 1, 1);
}

function endOfPrevMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 0, 23, 59, 59, 999);
}

router.get("/dashboard", async (req, res) => {
  const now = new Date();
  const curStart = startOfMonth(now);
  const curEnd = endOfMonth(now);
  const prevStart = startOfPrevMonth(now);
  const prevEnd = endOfPrevMonth(now);

  const uid = new mongoose.Types.ObjectId(req.userId);

  const [thisMonth, lastMonth, budget, recent] = await Promise.all([
    Expense.find({ userId: uid, date: { $gte: curStart, $lte: curEnd } }).lean(),
    Expense.find({ userId: uid, date: { $gte: prevStart, $lte: prevEnd } }).lean(),
    Budget.findOne({ userId: uid }).lean(),
    Expense.find({ userId: uid })
      .sort({ date: -1 })
      .limit(120)
      .lean(),
  ]);

  const sum = (arr) => arr.reduce((a, e) => a + e.amount, 0);
  const byCategory = (arr) =>
    arr.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
      return acc;
    }, {});

  const totalThisMonth = sum(thisMonth);
  const categoryTotalsThisMonth = byCategory(thisMonth);
  const categoryTotalsLastMonth = byCategory(lastMonth);

  let weekendTotal = 0;
  let weekdayTotal = 0;
  for (const e of recent) {
    const dow = new Date(e.date).getDay();
    if (dow === 0 || dow === 6) weekendTotal += e.amount;
    else weekdayTotal += e.amount;
  }

  const topCategory = Object.entries(categoryTotalsThisMonth).sort((a, b) => b[1] - a[1])[0]?.[0];

  const weeklyMap = {};
  for (const e of await Expense.find({
    userId: uid,
    date: { $gte: new Date(now.getFullYear(), now.getMonth() - 2, 1) },
  }).lean()) {
    const d = new Date(e.date);
    const oneJan = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil(((d - oneJan) / 86400000 + oneJan.getDay() + 1) / 7);
    const key = `${d.getFullYear()}-W${String(week).padStart(2, "0")}`;
    weeklyMap[key] = (weeklyMap[key] || 0) + e.amount;
  }
  const weeklyTrend = Object.entries(weeklyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([week, amount]) => ({ week, amount }));

  const monthlyAgg = await Expense.aggregate([
    { $match: { userId: uid } },
    {
      $group: {
        _id: { y: { $year: "$date" }, m: { $month: "$date" } },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1 } },
    { $limit: 18 },
  ]);

  const monthlySeries = monthlyAgg.map((r) => ({
    label: `${r._id.y}-${String(r._id.m).padStart(2, "0")}`,
    total: r.total,
  }));

  const categorySeries = await Expense.aggregate([
    { $match: { userId: uid } },
    {
      $group: {
        _id: { y: { $year: "$date" }, m: { $month: "$date" }, c: "$category" },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.y": 1, "_id.m": 1 } },
  ]);

  const predictionPayload = {
    monthly_totals: monthlySeries.map((m) => m.total),
    category_history: categorySeries.map((r) => ({
      ym: `${r._id.y}-${String(r._id.m).padStart(2, "0")}`,
      category: r._id.c,
      total: r.total,
    })),
  };

  const predictions = (await predictSpending(predictionPayload)) || {
    total_next_month: null,
    category_forecasts: {},
  };

  const insights = buildInsights({
    weekendTotal,
    weekdayTotal,
    categoryTotalsThisMonth,
    categoryTotalsLastMonth,
    topCategory,
    predictedNextMonth: predictions,
    categoryForecasts: predictions?.category_forecasts,
    monthlyBudget: budget?.monthlyLimit,
    spentThisMonth: totalThisMonth,
  });

  let budgetAlert = null;
  if (budget?.monthlyLimit) {
    const ratio = totalThisMonth / budget.monthlyLimit;
    if (ratio >= 1) budgetAlert = { level: "exceeded", percent: Math.round(ratio * 100) };
    else if (ratio >= 0.8) budgetAlert = { level: "warning", percent: Math.round(ratio * 100) };
  }

  res.json({
    totalThisMonth,
    categoryTotalsThisMonth,
    weeklyTrend,
    budget: budget
      ? {
          monthlyLimit: budget.monthlyLimit,
          spent: totalThisMonth,
          remaining: Math.max(0, budget.monthlyLimit - totalThisMonth),
          budgetAlert,
        }
      : null,
    predictions,
    insights,
    recentExpenses: recent.slice(0, 8),
  });
});

router.get("/reports/category", async (req, res) => {
  const now = new Date();
  const curStart = startOfMonth(now);
  const curEnd = endOfMonth(now);
  const uid = new mongoose.Types.ObjectId(req.userId);
  const rows = await Expense.find({ userId: uid, date: { $gte: curStart, $lte: curEnd } }).lean();
  const totals = rows.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0] || null;
  res.json({ totals, topCategory: top ? { name: top[0], amount: top[1] } : null });
});

export default router;
