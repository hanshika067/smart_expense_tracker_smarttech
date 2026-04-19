import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Other"],
    },
    date: { type: Date, required: true, index: true },
    description: { type: String, default: "", trim: true },
    classifiedByMl: { type: Boolean, default: false },
  },
  { timestamps: true }
);

expenseSchema.index({ userId: 1, date: -1 });

export default mongoose.model("Expense", expenseSchema);
