import LabOrder from '../models/LabOrder.js';
import Patient from '../models/Patient.js';

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, patient, category, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (patient) query.patient = patient;
    if (category) query['tests.category'] = category;
    if (search) {
      // Find matching patients by firstName, lastName, phone, or uhid
      const patientQuery = {
        $or: [
          { firstName: new RegExp(search, 'i') },
          { lastName: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') },
          { uhid: new RegExp(search, 'i') },
        ]
      };
      
      const parts = search.trim().split(/\s+/);
      if (parts.length > 1) {
        patientQuery.$or.push({
          $and: [
            { firstName: new RegExp(parts[0], 'i') },
            { lastName: new RegExp(parts[1], 'i') }
          ]
        });
      }

      const matchingPatients = await Patient.find(patientQuery).select('_id');
      const patientIds = matchingPatients.map(p => p._id);

      query.$or = [
        { orderNo: new RegExp(search, 'i') },
        { 'tests.testName': new RegExp(search, 'i') },
        { patient: { $in: patientIds } }
      ];
    }
    const orders = await LabOrder.find(query)
      .populate('patient', 'firstName lastName uhid phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
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
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
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
    const { status, testIndex } = req.body;
    const order = await LabOrder.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Lab order not found' });

    if (testIndex !== undefined && order.tests[testIndex]) {
      order.tests[testIndex].status = status;
      order.markModified('tests');
      if (status === 'collected') order.collectedAt = new Date();
    } else {
      order.status = status;
      if (status === 'collected') order.collectedAt = new Date();
      if (status === 'completed') order.completedAt = new Date();
    }

    const anyCollected = order.tests.some(t => t.status === 'collected');
    const anyInProgress = order.tests.some(t => t.status === 'processing' || t.status === 'in-progress');
    const anyPending = order.tests.some(t => t.status === 'pending');
    const allCompleted = order.tests.every(t => t.status === 'completed' || t.status === 'cancelled');

    if (allCompleted) order.status = 'completed';
    else if (anyInProgress) order.status = 'processing';
    else if (anyCollected) order.status = 'collected';
    else if (!anyPending) order.status = 'completed';
    else order.status = 'pending';

    await order.save();

    const populated = await LabOrder.findById(order._id)
      .populate('patient', 'firstName lastName uhid phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .populate('collectedBy testedBy verifiedBy', 'name');

    res.json({ order: populated });
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
