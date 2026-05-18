import mongoose from 'mongoose';

const nursingMARSchema = new mongoose.Schema({
  marNo: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  admission: { type: mongoose.Schema.Types.ObjectId, ref: 'IPDAdmission' },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
  medication: { type: String, required: true },
  dosage: String,
  route: { type: String, enum: ['oral', 'iv', 'im', 'sc', 'topical', 'inhalation', 'rectal', 'sublingual', 'other'] },
  frequency: String,
  scheduledTimes: [String],
  administrations: [{
    scheduledTime: String,
    administeredAt: Date,
    administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dose: String,
    status: { type: String, enum: ['given', 'held', 'refused', 'missed', 'delayed'], default: 'given' },
    remarks: String,
    vitals: {
      bp: String,
      pulse: Number,
      temperature: Number,
      spo2: Number,
    },
  }],
  startDate: { type: Date, default: Date.now },
  endDate: Date,
  status: { type: String, enum: ['active', 'completed', 'discontinued', 'on-hold'], default: 'active' },
  discontinuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  discontinuedReason: String,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

nursingMARSchema.pre('save', async function(next) {
  if (!this.marNo) {
    const count = await mongoose.model('NursingMAR').countDocuments();
    this.marNo = `MAR-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(5,'0')}`;
  }
  next();
});

export default mongoose.model('NursingMAR', nursingMARSchema);
