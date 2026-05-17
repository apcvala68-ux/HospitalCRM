import mongoose from 'mongoose';

const allergySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  substance: { type: String, required: true },
  type: { type: String, enum: ['drug', 'food', 'environmental', 'latex', 'contrast', 'other'], required: true },
  severity: { type: String, enum: ['mild', 'moderate', 'severe', 'life-threatening'], required: true },
  reaction: { type: String, required: true },
  onsetDate: Date,
  diagnosedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  notes: String,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

allergySchema.index({ patient: 1, substance: 1 }, { unique: true });

export default mongoose.model('Allergy', allergySchema);
