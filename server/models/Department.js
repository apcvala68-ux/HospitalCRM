import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String },
  headDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  location: { type: String },
}, { timestamps: true });

export default mongoose.model('Department', departmentSchema);
