import mongoose from 'mongoose';

const otSurgerySchema = new mongoose.Schema({
  surgeryNo: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  surgeon: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  assistantSurgeons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  anesthetist: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  nurses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  otRoom: { type: String, required: true },
  surgeryType: { type: String, enum: ['elective', 'emergency', 'day-care'], required: true },
  procedure: { type: String, required: true },
  procedureCodes: [String],
  diagnosis: String,
  icd10Codes: [String],
  scheduledDate: { type: Date, required: true },
  scheduledTime: String,
  estimatedDuration: Number,
  actualStartTime: Date,
  actualEndTime: Date,
  anesthesiaType: { type: String, enum: ['general', 'spinal', 'epidural', 'local', 'regional', 'sedation'] },
  status: { type: String, enum: ['scheduled', 'pre-op', 'in-progress', 'completed', 'cancelled', 'postponed'], default: 'scheduled' },
  preOpNotes: String,
  intraOpNotes: String,
  postOpNotes: String,
  complications: [String],
  implants: [{
    name: String,
    batchNo: String,
    manufacturer: String,
    quantity: Number,
  }],
  bloodRequired: Boolean,
  bloodUnits: Number,
  consentForm: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

otSurgerySchema.pre('save', async function(next) {
  if (!this.surgeryNo) {
    const count = await mongoose.model('OTSurgery').countDocuments();
    this.surgeryNo = `OT-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(5,'0')}`;
  }
  next();
});

otSurgerySchema.index({ patient: 1 });
otSurgerySchema.index({ surgeon: 1 });
otSurgerySchema.index({ status: 1 });
otSurgerySchema.index({ scheduledDate: 1 });

export default mongoose.model('OTSurgery', otSurgerySchema);
