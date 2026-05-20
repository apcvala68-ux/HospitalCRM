import mongoose from 'mongoose';

const bedSchema = new mongoose.Schema({
  ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', required: true },
  bedNo: { type: String, required: true },
  status: {
    type: String,
    enum: ['available', 'occupied', 'dirty', 'maintenance'],
    default: 'available',
  },
  currentPatient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  admissionDate: { type: Date },
  lastCleanedAt: { type: Date },
}, { timestamps: true });

bedSchema.index({ ward: 1, bedNo: 1 }, { unique: true });
bedSchema.index({ status: 1 });

export default mongoose.model('Bed', bedSchema);
