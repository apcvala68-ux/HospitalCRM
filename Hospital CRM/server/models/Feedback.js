import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  feedbackNo: { type: String, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  patientName: String,
  patientPhone: String,
  type: { type: String, enum: ['compliment', 'suggestion', 'complaint', 'general'], required: true },
  category: { type: String, enum: ['doctor', 'nursing', 'pharmacy', 'billing', 'housekeeping', 'food', 'ambulance', 'administration', 'other'] },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  subject: String,
  description: { type: String, required: true },
  status: { type: String, enum: ['open', 'in-progress', 'resolved', 'closed'], default: 'open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolution: String,
  resolvedAt: Date,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

feedbackSchema.pre('save', async function(next) {
  if (!this.feedbackNo) {
    const count = await mongoose.model('Feedback').countDocuments();
    this.feedbackNo = `FB-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(5,'0')}`;
  }
  next();
});

export default mongoose.model('Feedback', feedbackSchema);
