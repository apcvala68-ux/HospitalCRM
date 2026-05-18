import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  specialization: { type: String, required: true },
  licenseNo: { type: String, required: true, unique: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  consultationFee: { type: Number, default: 0 },
  qualifications: [{ type: String }],
  schedule: [{
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    startTime: String,
    endTime: String,
    slotDuration: { type: Number, default: 15 },
    isAvailable: { type: Boolean, default: true },
  }],
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

doctorSchema.index({ department: 1 });

export default mongoose.model('Doctor', doctorSchema);
