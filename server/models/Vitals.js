import mongoose from 'mongoose';

const vitalsSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  token: { type: mongoose.Schema.Types.ObjectId, ref: 'QueueToken' },
  bpSystolic: Number,
  bpDiastolic: Number,
  pulse: Number,
  temperature: Number,
  weight: Number,
  height: Number,
  spo2: Number,
  respiratoryRate: Number,
  bloodSugar: Number,
  chiefComplaint: { type: String, required: true },
  painScore: { type: Number, min: 0, max: 10 },
  triageNotes: String,
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

vitalsSchema.index({ patient: 1, createdAt: -1 });

export default mongoose.model('Vitals', vitalsSchema);
