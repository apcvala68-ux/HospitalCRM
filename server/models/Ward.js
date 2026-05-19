import mongoose from 'mongoose';

const wardSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['general', 'semi-private', 'private', 'icu'],
    required: true,
  },
  floor: { type: String },
  bedCount: { type: Number, required: true },
  ratePerDay: { type: Number, required: true },
  description: { type: String },
}, { timestamps: true });

export default mongoose.model('Ward', wardSchema);
