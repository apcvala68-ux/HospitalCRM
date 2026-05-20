import mongoose from 'mongoose';

const mortuarySchema = new mongoose.Schema({
  entryNo: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  declaredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  declaredAt: { type: Date, required: true },
  causeOfDeath: { type: String, required: true },
  icd10Code: String,
  bodyReceivedAt: { type: Date, default: Date.now },
  mortuaryNo: String,
  storageType: { type: String, enum: ['cold-storage', 'general'], default: 'cold-storage' },
  handedOverTo: {
    name: String,
    relation: String,
    phone: String,
    idProof: String,
  },
  handedOverAt: Date,
  deathCertificateNo: String,
  deathCertificateIssued: { type: Boolean, default: false },
  postMortemRequired: { type: Boolean, default: false },
  postMortemDone: { type: Boolean, default: false },
  postMortemReport: String,
  policeIntimation: { type: Boolean, default: false },
  remarks: String,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

mortuarySchema.pre('save', async function(next) {
  if (!this.entryNo) {
    const count = await mongoose.model('Mortuary').countDocuments();
    this.entryNo = `MRT-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(5,'0')}`;
  }
  next();
});

mortuarySchema.index({ patient: 1 });
mortuarySchema.index({ declaredBy: 1 });
mortuarySchema.index({ declaredAt: -1 });

export default mongoose.model('Mortuary', mortuarySchema);
