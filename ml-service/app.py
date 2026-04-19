from __future__ import annotations

import os
from collections import defaultdict
from typing import Optional

import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

app = Flask(__name__)
CORS(app)

CATEGORIES = [
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Other",
]

# Curated synthetic training pairs for demo / cold-start
TRAINING_TEXTS = [
    ("swiggy zomato food delivery biryani dinner lunch", "Food"),
    ("uber ola taxi metro fuel flight hotel travel", "Travel"),
    ("amazon flipkart clothes shoes sale mall", "Shopping"),
    ("electricity water rent internet phone recharge", "Bills"),
    ("netflix spotify movie game concert pub", "Entertainment"),
    ("pharmacy doctor hospital medicine gym", "Health"),
    ("atm cash transfer miscellaneous unknown", "Other"),
    ("groceries bigbasket milk bread vegetables", "Food"),
    ("train ticket bus pass toll parking", "Travel"),
    ("electronics gadget accessories gift", "Shopping"),
    ("insurance emi loan bank fee", "Bills"),
    ("sports stadium streaming subscription", "Entertainment"),
    ("dental clinic vitamins", "Health"),
    ("donation charity repair", "Other"),
]

_classifier: Optional[Pipeline] = None


def build_classifier():
    texts = [t for t, _ in TRAINING_TEXTS] * 4  # slight oversampling for tiny data
    labels = [c for _, c in TRAINING_TEXTS] * 4
    # Add single-token anchors per category
    for c in CATEGORIES:
        texts.append(c.lower())
        labels.append(c)
    pipe = Pipeline(
        [
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
            ("clf", LogisticRegression(max_iter=500, class_weight="balanced")),
        ]
    )
    pipe.fit(texts, labels)
    return pipe


def get_classifier():
    global _classifier
    if _classifier is None:
        _classifier = build_classifier()
    return _classifier


def linear_next(values: list) -> Optional[float]:
    y = np.array(values, dtype=float)
    if y.size < 2:
        return float(y.sum()) if y.size else None
    x = np.arange(y.size, dtype=float).reshape(-1, 1)
    # Normal equation for simple linear regression
    x_ = np.hstack([np.ones_like(x), x])
    beta, _, _, _ = np.linalg.lstsq(x_, y, rcond=None)
    next_x = np.array([[1.0, float(y.size)]])
    pred = float((next_x @ beta.reshape(-1, 1)).ravel()[0])
    return max(0.0, pred)


@app.get("/health")
def health():
    return jsonify({"ok": True})


@app.post("/classify-expense")
def classify_expense():
    body = request.get_json(force=True, silent=True) or {}
    description = (body.get("description") or "").strip()
    if not description:
        return jsonify({"category": "Other", "confidence": 0.0})

    clf = get_classifier()
    proba = None
    try:
        cat = clf.predict([description.lower()])[0]
        if hasattr(clf, "predict_proba"):
            pr = clf.predict_proba([description.lower()])[0]
            proba = float(pr.max())
    except Exception:
        cat = "Other"
        proba = 0.0

    if cat not in CATEGORIES:
        cat = "Other"
    return jsonify({"category": cat, "confidence": proba})


@app.post("/predict-expense")
def predict_expense():
    body = request.get_json(force=True, silent=True) or {}
    monthly_totals = body.get("monthly_totals") or []
    category_history = body.get("category_history") or []

    total_next = linear_next([float(x) for x in monthly_totals]) if monthly_totals else None

    by_cat: dict[str, list[float]] = defaultdict(list)
    # naive: last value per ym per category then take last 6 months order not preserved — improve by ym sort
    ym_cat_totals: dict[tuple[str, str], float] = {}
    for row in category_history:
        ym = row.get("ym")
        cat = row.get("category")
        tot = float(row.get("total") or 0)
        if ym and cat:
            ym_cat_totals[(ym, cat)] = tot

    sorted_yms = sorted({ym for (ym, _) in ym_cat_totals.keys()})
    for cat in CATEGORIES:
        series = [ym_cat_totals.get((ym, cat), 0.0) for ym in sorted_yms]
        if series:
            by_cat[cat] = series[-6:]

    category_forecasts = {}
    for cat, series in by_cat.items():
        pred = linear_next(series)
        if pred is not None and pred > 0:
            category_forecasts[cat] = round(pred, 2)

    return jsonify(
        {
            "total_next_month": round(total_next, 2) if total_next is not None else None,
            "category_forecasts": category_forecasts,
        }
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8000"))
    app.run(host="0.0.0.0", port=port, debug=False)
