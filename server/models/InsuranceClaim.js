import mongoose from 'mongoose';

const insuranceClaimSchema = new mongoose.Schema({
  claimNo: { type: String, unique: true },
  billing: { type: mongoose.Schema.Types.ObjectId, ref: 'Billing' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  tpaName: { type: String, required: true },
  policyNo: { type: String, required: true },
  policyHolder: String,
  sumInsured: Number,
  claimAmount: { type: Number, required: true },
  approvedAmount: Number,
  rejectedAmount: Number,
  deductionAmount: Number,
  status: { type: String, enum: ['pre-auth', 'submitted', 'under-review', 'approved', 'partially-approved', 'rejected', 'settled'], default: 'pre-auth' },
  submissionDate: { type: Date, default: Date.now },
  approvalDate: Date,
  settlementDate: Date,
  rejectionReason: String,
  documents: [{
    name: String,
    uploadedAt: { type: Date, default: Date.now },
  }],
  remarks: String,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

insuranceClaimSchema.pre('save', async function(next) {
  if (!this.claimNo) {
    const count = await mongoose.model('InsuranceClaim').countDocuments();
    this.claimNo = `IC-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(5,'0')}`;
  }
  next();
});

insuranceClaimSchema.index({ patient: 1 });
insuranceClaimSchema.index({ status: 1 });
insuranceClaimSchema.index({ tpaName: 1 });
insuranceClaimSchema.index({ submissionDate: -1 });

export default mongoose.model('InsuranceClaim', insuranceClaimSchema);
