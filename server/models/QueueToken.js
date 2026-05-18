import mongoose from 'mongoose';

const queueTokenSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  tokenNo: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['waiting', 'triage', 'ready', 'called', 'with-doctor', 'completed', 'no-show', 'cancelled'],
    default: 'waiting',
  },
  calledAt: { type: Date },
  completedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

queueTokenSchema.index({ doctor: 1, date: 1 });
queueTokenSchema.index({ tokenNo: 1, date: 1 });

export default mongoose.model('QueueToken', queueTokenSchema);
