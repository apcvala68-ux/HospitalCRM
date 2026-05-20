import mongoose from 'mongoose';

const bloodBankSchema = new mongoose.Schema({
  entryNo: { type: String, unique: true },
  type: { type: String, enum: ['donation', 'issue', 'return', 'discard'], required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  donorName: String,
  donorPhone: String,
  donorAge: Number,
  donorGender: { type: String, enum: ['male', 'female', 'other'] },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  quantity: { type: Number, required: true },
  unit: { type: String, enum: ['unit', 'ml'], default: 'unit' },
  collectionDate: { type: Date, default: Date.now },
  expiryDate: Date,
  storageLocation: String,
  status: { type: String, enum: ['collected', 'stored', 'issued', 'returned', 'discarded', 'expired'], default: 'collected' },
  crossMatchResult: { type: String, enum: ['compatible', 'incompatible', 'pending', 'not-required'] },
  issuedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  issuedFor: String,
  remarks: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

bloodBankSchema.pre('save', async function(next) {
  if (!this.entryNo) {
    const count = await mongoose.model('BloodBank').countDocuments();
    this.entryNo = `BB-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(5,'0')}`;
  }
  next();
});

bloodBankSchema.index({ bloodGroup: 1 });
bloodBankSchema.index({ status: 1 });
bloodBankSchema.index({ type: 1 });
bloodBankSchema.index({ patient: 1 });
bloodBankSchema.index({ expiryDate: 1 });

export default mongoose.model('BloodBank', bloodBankSchema);
