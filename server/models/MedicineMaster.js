import mongoose from 'mongoose';

const medicineMasterSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  genericName: { type: String, trim: true },
  category: { type: String, trim: true },
  unit: { type: String, default: 'tablet', enum: ['tablet', 'capsule', 'ml', 'mg', 'injection', 'drop', 'sachet', 'syrup', 'cream', 'other'] },
  reorderLevel: { type: Number, default: 10 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

medicineMasterSchema.index({ name: 1 }, { unique: true });
medicineMasterSchema.index({ genericName: 1 });

export default mongoose.model('MedicineMaster', medicineMasterSchema);
