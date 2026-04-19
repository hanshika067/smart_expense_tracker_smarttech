# 💸 Smart Expense Tracker – SmartTech

An AI-powered full-stack expense tracking application that helps users monitor spending, gain insights, and make smarter financial decisions.

---

## 🚀 Features

* 🔐 User Authentication (Signup/Login)
* 💰 Add, edit, and delete expenses
* 📊 Dashboard with real-time analytics
* 🧠 AI-powered insights & spending predictions
* 📈 Category-wise expense breakdown
* 📅 Monthly reports & trends
* ⚠️ Budget tracking and alerts

---

## 🧠 AI/ML Capabilities

* Expense categorization
* Spending pattern analysis
* Future expense prediction (time-series based)
* Smart saving suggestions

---

## 🏗️ Tech Stack

### 🌐 Frontend

* React (Vite)
* Tailwind CSS
* Context API

### ⚙️ Backend

* Node.js
* Express.js
* MongoDB

### 🤖 ML Service

* Python
* Flask / FastAPI (depending on your setup)
* Pandas, Scikit-learn

---

## 📁 Project Structure

```
smart-expense-tracker/
│
├── client/        # Frontend (React + Vite)
├── server/        # Backend (Node + Express)
├── ml-service/    # Machine Learning Service (Python)
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the repository

```
git clone https://github.com/hanshika067/smart_expense_tracker_smarttech.git
cd smart_expense_tracker_smarttech
```

---

### 2️⃣ Start MongoDB

Make sure MongoDB is running locally:

```
mongodb://127.0.0.1:27017
```

---

### 3️⃣ Start ML Service

```
cd ml-service
python app.py
```

Runs on: `http://localhost:8000`

---

### 4️⃣ Start Backend Server

```
cd server
npm install
npm start
```

Runs on: `http://localhost:5000`

---

### 5️⃣ Start Frontend

```
cd client
npm install
npm run dev
```

Runs on: `http://localhost:5173`

---

## 🔗 API Flow

```
Frontend (React)
      ↓
Backend API (Node.js)
      ↓
ML Service (Python)
      ↓
MongoDB
```

---
## 👩‍💻 Author

**Hanshika**

* GitHub: https://github.com/hanshika067

---

