import mongoose from 'mongoose';

const housekeepingSchema = new mongoose.Schema({
  ticketNo: { type: String, unique: true },
  type: { type: String, enum: ['cleaning', 'maintenance', 'pest-control', 'deep-clean', 'other'], required: true },
  location: { type: String, required: true },
  ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward' },
  bed: { type: mongoose.Schema.Types.ObjectId, ref: 'Bed' },
  roomNo: String,
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['open', 'assigned', 'in-progress', 'completed', 'cancelled'], default: 'open' },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedAt: Date,
  startedAt: Date,
  completedAt: Date,
  remarks: String,
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

housekeepingSchema.pre('save', async function(next) {
  if (!this.ticketNo) {
    const count = await mongoose.model('Housekeeping').countDocuments();
    this.ticketNo = `HK-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(5,'0')}`;
  }
  next();
});

export default mongoose.model('Housekeeping', housekeepingSchema);
