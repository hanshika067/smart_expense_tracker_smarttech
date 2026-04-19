import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    monthlyLimit: { type: Number, required: true, min: 0 },
    month: { type: Number, min: 1, max: 12 },
    year: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);
