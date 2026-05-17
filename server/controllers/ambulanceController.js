import Ambulance from '../models/Ambulance.js';

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, emergencyType } = req.query;
    const query = {};
    if (status) query.status = status;
    if (emergencyType) query.emergencyType = emergencyType;
    const records = await Ambulance.find(query)
      .populate('patient', 'firstName lastName uhid')
      .populate('driver paramedic', 'name phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Ambulance.countDocuments(query);
    res.json({ records, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const record = await Ambulance.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone age gender')
      .populate('driver paramedic', 'name phone');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ record });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const record = await Ambulance.create(req.body);
    res.status(201).json({ record });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const record = await Ambulance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ record });
  } catch (error) { next(error); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updates = { status };
    const now = new Date();
    if (status === 'en-route') updates.dispatchedAt = now;
    if (status === 'at-scene') updates.arrivedAtScene = now;
    if (status === 'transporting') updates.departedScene = now;
    if (status === 'arrived') updates.arrivedAtHospital = now;
    if (status === 'returned') updates.returnedToBase = now;
    const record = await Ambulance.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ record });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const total = await Ambulance.countDocuments();
    const active = await Ambulance.countDocuments({ status: { $in: ['dispatched', 'en-route', 'at-scene', 'transporting'] } });
    const todayDispatches = await Ambulance.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });
    res.json({ total, active, todayDispatches });
  } catch (error) { next(error); }
};
