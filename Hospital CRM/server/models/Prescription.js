import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  diagnosis: [{
    code: String,
    description: String,
  }],
  medicines: [{
    name: { type: String, required: true },
    dosage: String,
    frequency: String,
    duration: String,
    route: { type: String, default: 'oral' },
    instructions: String,
    isActive: { type: Boolean, default: true },
  }],
  labTests: [{
    testName: { type: String, required: true },
    instructions: String,
    isCompleted: { type: Boolean, default: false },
  }],
  notes: String,
  followUpDate: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ doctor: 1 });

export default mongoose.model('Prescription', prescriptionSchema);
