import mongoose from 'mongoose';

const staffRosterSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  date: { type: Date, required: true },
  shift: { type: String, enum: ['morning', 'afternoon', 'night', 'general'], required: true },
  shiftHours: {
    start: String,
    end: String,
  },
  role: String,
  status: { type: String, enum: ['scheduled', 'checked-in', 'completed', 'absent', 'on-leave', 'swapped'], default: 'scheduled' },
  swappedWith: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  leaveType: { type: String, enum: ['casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid'] },
  notes: String,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

staffRosterSchema.index({ staff: 1, date: 1 }, { unique: true });

export default mongoose.model('StaffRoster', staffRosterSchema);
