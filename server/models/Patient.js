import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  uhid: { type: String, unique: true, required: true },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
    pincode: String,
  },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  allergies: [{ type: String }],
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  aadhaar: String,
  maritalStatus: { type: String, enum: ['single', 'married', 'divorced', 'widowed'] },
  occupation: String,
  medicalHistory: {
    conditions: [{ type: String }],
    surgeries: [{ type: String }],
    familyHistory: [{ type: String }],
    immunizations: [{ type: String }],
    habits: {
      smoking: String,
      alcohol: String,
      tobacco: String,
    },
  },
  insurance: {
    provider: String,
    policyNo: String,
    expiry: Date,
  },
  registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  qrCode: { type: String },
}, { timestamps: true });

patientSchema.index({ phone: 1 });
patientSchema.index({ firstName: 'text', lastName: 'text' });

export default mongoose.model('Patient', patientSchema);
