import mongoose from 'mongoose';

const purchaseOrderSchema = new mongoose.Schema({
  poNo: { type: String, unique: true },
  vendor: {
    name: { type: String, required: true },
    contact: String,
    email: String,
    phone: String,
    address: String,
    gstNo: String,
    drugLicenseNo: String,
  },
  items: [{
    medicineName: { type: String, required: true },
    genericName: String,
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'strip' },
    rate: { type: Number, required: true },
    mrp: Number,
    batchNo: String,
    expiryDate: Date,
    gst: { type: Number, default: 0 },
    amount: Number,
  }],
  subtotal: Number,
  tax: Number,
  total: Number,
  status: { type: String, enum: ['draft', 'ordered', 'received', 'partial', 'cancelled'], default: 'draft' },
  orderDate: { type: Date, default: Date.now },
  expectedDelivery: Date,
  receivedDate: Date,
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paymentTerms: String,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

purchaseOrderSchema.pre('save', async function(next) {
  if (!this.poNo) {
    const count = await mongoose.model('PurchaseOrder').countDocuments();
    this.poNo = `PO-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}-${String(count+1).padStart(5,'0')}`;
  }
  if (this.items && this.items.length > 0) {
    this.items.forEach(item => {
      item.amount = (item.quantity * item.rate) + (item.quantity * item.rate * (item.gst || 0) / 100);
    });
    this.subtotal = this.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    this.tax = this.items.reduce((sum, item) => sum + (item.quantity * item.rate * (item.gst || 0) / 100), 0);
    this.total = this.subtotal + this.tax;
  }
  next();
});

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
