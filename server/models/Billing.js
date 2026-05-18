import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  invoiceNo: { type: String, unique: true, required: true },
  items: [{
    description: { type: String, required: true },
    category: { type: String, enum: ['consultation', 'pharmacy', 'lab', 'ipd', 'surgery', 'ambulance', 'other'] },
    quantity: { type: Number, required: true, default: 1 },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
  }],
  paymentSplits: [{
    method: { type: String, enum: ['cash', 'upi', 'card', 'insurance', 'credit'], required: true },
    amount: { type: Number, required: true },
    reference: String,
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'cancelled', 'refunded'],
    default: 'pending',
  },
  dueDate: { type: Date },
  paidAt: { type: Date },
  paymentMethod: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
}, { timestamps: true });

billingSchema.index({ patient: 1 });
billingSchema.index({ status: 1 });

export default mongoose.model('Billing', billingSchema);
