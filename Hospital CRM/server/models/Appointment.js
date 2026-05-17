import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  timeSlot: {
    start: { type: String, required: true },
    end: { type: String, required: true },
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'checked-in', 'completed', 'cancelled', 'no-show'],
    default: 'scheduled',
  },
  type: { type: String, enum: ['opd', 'follow-up', 'emergency'], default: 'opd' },
  reason: { type: String, trim: true },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  billing: { type: mongoose.Schema.Types.ObjectId, ref: 'Billing' },
}, { timestamps: true });

appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ status: 1 });

export default mongoose.model('Appointment', appointmentSchema);
