import mongoose from 'mongoose';

const labOrderSchema = new mongoose.Schema({
  orderNo: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  tests: [{
    testName: { type: String, required: true },
    testCode: String,
    category: { type: String, enum: ['hematology', 'biochemistry', 'microbiology', 'serology', 'urinalysis', 'radiology', 'pathology', 'other'] },
    priority: { type: String, enum: ['routine', 'urgent', 'stat'], default: 'routine' },
    result: String,
    resultValue: String,
    normalRange: String,
    unit: String,
    status: { type: String, enum: ['pending', 'collected', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
    remarks: String,
  }],
  status: { type: String, enum: ['pending', 'collected', 'processing', 'completed', 'cancelled'], default: 'pending' },
  collectedAt: Date,
  completedAt: Date,
  collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  testedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isVerified: { type: Boolean, default: false },
  notes: String,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

labOrderSchema.pre('save', async function(next) {
  if (!this.orderNo) {
    const count = await mongoose.model('LabOrder').countDocuments();
    this.orderNo = `LAB-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(5,'0')}`;
  }
  next();
});

labOrderSchema.index({ patient: 1 });
labOrderSchema.index({ doctor: 1 });
labOrderSchema.index({ status: 1 });
labOrderSchema.index({ createdAt: -1 });

export default mongoose.model('LabOrder', labOrderSchema);
