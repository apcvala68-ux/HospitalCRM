import MedicineMaster from '../models/MedicineMaster.js';
import PharmacyInventory from '../models/PharmacyInventory.js';

const MED_SORTABLE = ['createdAt', 'name', 'genericName', 'category', 'reorderLevel'];

export const listMedicines = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder, category } = req.query;
    const query = { isActive: true };
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { genericName: new RegExp(search, 'i') },
      ];
    }
    if (category) query.category = category;
    const sortField = MED_SORTABLE.includes(sortBy) ? sortBy : 'name';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const total = await MedicineMaster.countDocuments(query);
    const medicines = await MedicineMaster.find(query)
      .sort({ [sortField]: sortDir })
      .limit(Number(limit))
      .skip((page - 1) * Number(limit));
    res.json({ medicines, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const createMedicine = async (req, res, next) => {
  try {
    const medicine = await MedicineMaster.create(req.body);
    res.status(201).json({ medicine });
  } catch (error) { next(error); }
};

const INV_SORTABLE = ['createdAt', 'expiryDate', 'quantity', 'mrp'];

export const listInventory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder, medicineId, lowStock } = req.query;
    const query = {};
    if (medicineId) query.medicine = medicineId;
    if (lowStock === 'true') {
      const meds = await MedicineMaster.find({ isActive: true }).select('_id reorderLevel');
      const medIds = meds.filter(m => m.reorderLevel > 0).map(m => m._id);
      query.medicine = { $in: medIds };
    }
    const sortField = INV_SORTABLE.includes(sortBy) ? sortBy : 'expiryDate';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const total = await PharmacyInventory.countDocuments(query);
    const inventory = await PharmacyInventory.find(query)
      .populate('medicine', 'name genericName unit reorderLevel')
      .sort({ [sortField]: sortDir })
      .limit(Number(limit))
      .skip((page - 1) * Number(limit));
    res.json({ inventory, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const addStock = async (req, res, next) => {
  try {
    const { medicine, batchNo, expiryDate, quantity, mrp, costPrice, supplier } = req.body;
    let item = await PharmacyInventory.findOne({ medicine, batchNo });
    if (item) {
      item.quantity += quantity;
      if (mrp) item.mrp = mrp;
      await item.save();
    } else {
      item = await PharmacyInventory.create({ medicine, batchNo, expiryDate, quantity, mrp, costPrice, supplier });
    }
    const populated = await PharmacyInventory.findById(item._id)
      .populate('medicine', 'name genericName unit');
    res.status(201).json({ inventory: populated });
  } catch (error) { next(error); }
};

export const dispense = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const item = await PharmacyInventory.findById(req.params.id).populate('medicine', 'name');
    if (!item) return res.status(404).json({ message: 'Stock not found' });
    if (item.quantity < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Available: ${item.quantity}` });
    }
    item.quantity -= quantity;
    await item.save();
    res.json({ inventory: item });
  } catch (error) { next(error); }
};

export const lowStockAlerts = async (req, res, next) => {
  try {
    const meds = await MedicineMaster.find({ isActive: true });
    const alerts = [];
    for (const med of meds) {
      const totalQty = await PharmacyInventory.aggregate([
        { $match: { medicine: med._id } },
        { $group: { _id: null, total: { $sum: '$quantity' } } },
      ]);
      const qty = totalQty[0]?.total || 0;
      if (qty <= med.reorderLevel) {
        alerts.push({ medicine: med, currentStock: qty, reorderLevel: med.reorderLevel });
      }
    }
    res.json({ alerts });
  } catch (error) { next(error); }
};
