import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  headDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  location: { type: String },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  isActive: { type: Boolean, default: true },
  revenue: { type: Number, default: 0 },
}, { timestamps: true });

departmentSchema.index({ isActive: 1 });

export default mongoose.model('Department', departmentSchema);
