import mongoose from 'mongoose';

const pharmacyInventorySchema = new mongoose.Schema({
  medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicineMaster', required: true },
  batchNo: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  quantity: { type: Number, required: true, default: 0 },
  mrp: { type: Number, required: true },
  costPrice: { type: Number },
  supplier: { type: String },
  location: { type: String },
}, { timestamps: true });

pharmacyInventorySchema.index({ medicine: 1, batchNo: 1 }, { unique: true });
pharmacyInventorySchema.index({ expiryDate: 1 });

export default mongoose.model('PharmacyInventory', pharmacyInventorySchema);
