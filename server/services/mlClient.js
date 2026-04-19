import fetch from "node-fetch";

const baseUrl = () => process.env.ML_SERVICE_URL || "http://127.0.0.1:8000";

export async function classifyExpense(description) {
  const url = `${baseUrl()}/classify-expense`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: description || "" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.category) return { category: data.category, confidence: data.confidence ?? null };
    return null;
  } catch {
    return null;
  }
}

export async function predictSpending(payload) {
  const url = `${baseUrl()}/predict-expense`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
