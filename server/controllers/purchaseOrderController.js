import PurchaseOrder from '../models/PurchaseOrder.js';

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, vendor } = req.query;
    const query = {};
    if (status) query.status = status;
    if (vendor) query['vendor.name'] = new RegExp(vendor, 'i');
    const orders = await PurchaseOrder.find(query)
      .populate('createdBy receivedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await PurchaseOrder.countDocuments(query);
    res.json({ orders, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findById(req.params.id)
      .populate('createdBy receivedBy', 'name');
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });
    res.json({ order });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ order });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const order = await PurchaseOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });
    res.json({ order });
  } catch (error) { next(error); }
};

export const receive = async (req, res, next) => {
  try {
    const { receivedItems } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Purchase order not found' });
    order.status = receivedItems.length === order.items.length ? 'received' : 'partial';
    order.receivedDate = new Date();
    order.receivedBy = req.user._id;
    await order.save();
    res.json({ order });
  } catch (error) { next(error); }
};

export const vendorList = async (req, res, next) => {
  try {
    const vendors = await PurchaseOrder.aggregate([
      { $group: {
        _id: '$vendor.name',
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$total' },
        lastOrder: { $max: '$orderDate' },
      }},
      { $sort: { totalSpent: -1 } },
    ]);
    res.json({ vendors: vendors.map(v => ({ name: v._id, totalOrders: v.totalOrders, totalSpent: v.totalSpent, lastOrder: v.lastOrder })) });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const total = await PurchaseOrder.countDocuments();
    const pending = await PurchaseOrder.countDocuments({ status: { $in: ['draft', 'ordered'] } });
    const todayOrders = await PurchaseOrder.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });
    const totalSpent = await PurchaseOrder.aggregate([
      { $match: { status: 'received' } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    res.json({ total, pending, todayOrders, totalSpent: totalSpent[0]?.total || 0 });
  } catch (error) { next(error); }
};
