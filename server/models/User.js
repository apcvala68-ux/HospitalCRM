import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'receptionist', 'nurse', 'cashier', 'pharmacist'],
    required: true,
  },
  phone: { type: String, trim: true },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  dateOfBirth: { type: Date },
  address: { type: String },
  bio: { type: String, trim: true },
  preferences: {
    language: { type: String, default: 'en' },
    emailNotifications: { type: Boolean, default: true },
  },
  avatar: { type: String },
  googleTokens: {
    accessToken: String,
    refreshToken: String,
    expiryDate: Number,
  },
  isActive: { type: Boolean, default: true },
  shift: { type: String, enum: ['morning', 'evening', 'night', 'general'], default: 'general' },
  lastLogin: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
}, { timestamps: true });

userSchema.index({ role: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
