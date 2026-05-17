import mongoose from 'mongoose';

const ambulanceSchema = new mongoose.Schema({
  dispatchNo: { type: String, unique: true },
  vehicleNo: { type: String, required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paramedic: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  callerName: String,
  callerPhone: { type: String, required: true },
  pickupLocation: { type: String, required: true },
  destination: { type: String, enum: ['hospital', 'other-hospital', 'home'], default: 'hospital' },
  destinationHospital: String,
  emergencyType: { type: String, enum: ['accident', 'cardiac', 'respiratory', 'trauma', 'stroke', 'obstetric', 'pediatric', 'other'], required: true },
  triageLevel: { type: String, enum: ['red', 'yellow', 'green', 'black'], default: 'green' },
  status: { type: String, enum: ['dispatched', 'en-route', 'at-scene', 'transporting', 'arrived', 'returned', 'cancelled'], default: 'dispatched' },
  dispatchedAt: { type: Date, default: Date.now },
  arrivedAtScene: Date,
  departedScene: Date,
  arrivedAtHospital: Date,
  returnedToBase: Date,
  vitals: {
    bp: String,
    pulse: Number,
    spo2: Number,
    temperature: Number,
    respiratoryRate: Number,
    glasgowComaScale: Number,
  },
  interventions: [String],
  notes: String,
  kmTravelled: Number,
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

ambulanceSchema.pre('save', async function(next) {
  if (!this.dispatchNo) {
    const count = await mongoose.model('Ambulance').countDocuments();
    this.dispatchNo = `AMB-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(5,'0')}`;
  }
  next();
});

export default mongoose.model('Ambulance', ambulanceSchema);
