import mongoose from 'mongoose';

const ipdAdmissionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed', required: true },
  ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward', required: true },
  admittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admissionDate: { type: Date, default: Date.now },
  dischargeDate: { type: Date },
  diagnosis: { type: String },
  admittingDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  vitals: [{
    recordedAt: { type: Date, default: Date.now },
    bp: String,
    temperature: String,
    pulse: Number,
    spo2: Number,
    weight: Number,
    height: Number,
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  dailyNotes: [{
    date: { type: Date, default: Date.now },
    note: String,
    category: { type: String, enum: ['nursing', 'doctor', 'diet', 'general'] },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    route: String,
    startDate: Date,
    endDate: Date,
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  }],
  status: { type: String, enum: ['active', 'discharged'], default: 'active' },
  dischargeSummary: { type: String },
  diet: { type: String, enum: ['regular', 'diabetic', 'liquid', 'soft', 'low-sodium', 'renal'], default: 'regular' },
}, { timestamps: true });

ipdAdmissionSchema.index({ patient: 1, status: 1 });
ipdAdmissionSchema.index({ bed: 1, status: 1 });

export default mongoose.model('IPDAdmission', ipdAdmissionSchema);
