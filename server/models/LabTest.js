import mongoose from 'mongoose';

const labTestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  testName: { type: String, required: true },
  instructions: String,
  status: {
    type: String,
    enum: ['ordered', 'sample-collected', 'processing', 'completed', 'cancelled'],
    default: 'ordered',
  },
  result: {
    value: String,
    unit: String,
    referenceRange: String,
    notes: String,
  },
  orderedAt: { type: Date, default: Date.now },
  collectedAt: Date,
  completedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

labTestSchema.index({ patient: 1 });
labTestSchema.index({ doctor: 1 });
labTestSchema.index({ status: 1 });

export default mongoose.model('LabTest', labTestSchema);
