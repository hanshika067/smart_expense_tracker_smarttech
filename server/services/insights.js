function pctChange(prev, curr) {
  if (!prev || prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

export function buildInsights({
  weekendTotal,
  weekdayTotal,
  categoryTotalsThisMonth,
  categoryTotalsLastMonth,
  topCategory,
  predictedNextMonth,
  categoryForecasts,
  monthlyBudget,
  spentThisMonth,
}) {
  const insights = [];

  if (weekendTotal + weekdayTotal > 0) {
    const wkndShare = weekendTotal / (weekendTotal + weekdayTotal);
    if (wkndShare >= 0.55) {
      insights.push({
        type: "pattern",
        title: "Weekend spending",
        detail: `About ${Math.round(wkndShare * 100)}% of recent spending landed on weekends. Shifting a few outings to weekdays can flatten spikes.`,
        severity: "info",
      });
    } else if (weekdayTotal > 0 && weekendTotal / weekdayTotal >= 1.35) {
      insights.push({
        type: "pattern",
        title: "Weekends cost more",
        detail: "You spend noticeably more on weekends than weekdays—plan weekend budgets separately.",
        severity: "warning",
      });
    }
  }

  if (topCategory && categoryTotalsThisMonth[topCategory]) {
    const last = categoryTotalsLastMonth[topCategory] || 0;
    const curr = categoryTotalsThisMonth[topCategory];
    const ch = pctChange(last, curr);
    if (ch >= 15) {
      insights.push({
        type: "trend",
        title: `${topCategory} is heating up`,
        detail: `${topCategory} is up about ${ch}% vs last month. That's your top category right now.`,
        severity: "warning",
      });
    } else if (ch <= -10) {
      insights.push({
        type: "trend",
        title: `${topCategory} cooled down`,
        detail: `${topCategory} dropped about ${Math.abs(ch)}% month over month—nice discipline.`,
        severity: "success",
      });
    }
  }

  const sortedCats = Object.entries(categoryTotalsThisMonth).sort((a, b) => b[1] - a[1]);
  if (sortedCats.length) {
    const [c1, amt1] = sortedCats[0];
    const potential = Math.round(amt1 * 0.15);
    if (potential >= 500) {
      insights.push({
        type: "saving",
        title: "Smart trim",
        detail: `Trimming ~15% from ${c1} (₹${amt1.toLocaleString("en-IN")}) could free about ₹${potential.toLocaleString("en-IN")} monthly.`,
        severity: "success",
      });
    }
  }

  if (monthlyBudget && spentThisMonth >= monthlyBudget * 0.8 && spentThisMonth < monthlyBudget) {
    insights.push({
      type: "budget",
      title: "Budget runway",
      detail: `You've used about ${Math.round((spentThisMonth / monthlyBudget) * 100)}% of this month's budget.`,
      severity: "warning",
    });
  }

  if (predictedNextMonth?.total_next_month) {
    const p = Math.round(predictedNextMonth.total_next_month);
    insights.push({
      type: "forecast",
      title: "Next month outlook",
      detail: `You might spend roughly ₹${p.toLocaleString("en-IN")} next month in total, based on your history.`,
      severity: "info",
    });
  }

  if (topCategory && categoryForecasts?.[topCategory]) {
    const c = Math.round(categoryForecasts[topCategory]);
    insights.push({
      type: "forecast_cat",
      title: `${topCategory} lens`,
      detail: `Next month you may spend about ₹${c.toLocaleString("en-IN")} on ${topCategory} based on recent trends in that category.`,
      severity: "info",
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: "general",
      title: "You're all set",
      detail: "Keep logging expenses—patterns emerge after a few weeks of consistent data.",
      severity: "info",
    });
  }

  return insights;
}
