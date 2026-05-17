import LabOrder from '../models/LabOrder.js';

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, patient, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (patient) query.patient = patient;
    if (category) query['tests.category'] = category;
    const orders = await LabOrder.find(query)
      .populate('patient', 'firstName lastName uhid phone')
      .populate('doctor', 'user')
      .populate('collectedBy testedBy verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await LabOrder.countDocuments(query);
    res.json({ orders, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const order = await LabOrder.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone age gender')
      .populate('doctor', 'user')
      .populate('collectedBy testedBy verifiedBy', 'name');
    if (!order) return res.status(404).json({ message: 'Lab order not found' });
    res.json({ order });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const order = await LabOrder.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ order });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const order = await LabOrder.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!order) return res.status(404).json({ message: 'Lab order not found' });
    res.json({ order });
  } catch (error) { next(error); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updates = { status };
    if (status === 'collected') updates.collectedAt = new Date();
    if (status === 'completed') updates.completedAt = new Date();
    const order = await LabOrder.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ order });
  } catch (error) { next(error); }
};

export const addResult = async (req, res, next) => {
  try {
    const { testIndex, result, resultValue, normalRange, unit, remarks } = req.body;
    const order = await LabOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Lab order not found' });
    if (order.tests[testIndex]) {
      order.tests[testIndex] = { ...order.tests[testIndex].toObject(), result, resultValue, normalRange, unit, remarks, status: 'completed' };
    }
    order.testedBy = req.user._id;
    const allCompleted = order.tests.every(t => t.status === 'completed' || t.status === 'cancelled');
    if (allCompleted) order.status = 'completed';
    await order.save();
    res.json({ order });
  } catch (error) { next(error); }
};

export const verify = async (req, res, next) => {
  try {
    const order = await LabOrder.findByIdAndUpdate(req.params.id, { isVerified: true, verifiedBy: req.user._id }, { new: true });
    res.json({ order });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const total = await LabOrder.countDocuments();
    const pending = await LabOrder.countDocuments({ status: 'pending' });
    const todayOrders = await LabOrder.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });
    const completed = await LabOrder.countDocuments({ status: 'completed' });
    res.json({ total, pending, todayOrders, completed });
  } catch (error) { next(error); }
};
