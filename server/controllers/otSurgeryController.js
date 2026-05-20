import OTSurgery from '../models/OTSurgery.js';

const SORTABLE_FIELDS = ['createdAt', 'surgeryNo', 'status', 'procedure', 'otRoom', 'scheduledDate'];

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder, status, date } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { surgeryNo: new RegExp(search, 'i') },
        { procedure: new RegExp(search, 'i') },
        { otRoom: new RegExp(search, 'i') },
      ];
    }
    if (status) query.status = status;
    if (date) query.scheduledDate = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) };
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'scheduledDate';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const surgeries = await OTSurgery.find(query)
      .populate('patient', 'firstName lastName uhid')
      .populate('surgeon assistantSurgeons anesthetist', 'user')
      .populate('nurses', 'name')
      .sort({ [sortField]: sortDir })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await OTSurgery.countDocuments(query);
    res.json({ surgeries, total, page: +page, pages: Math.ceil(total / limit), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const surgery = await OTSurgery.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone age gender')
      .populate('surgeon assistantSurgeons anesthetist', 'user specialization')
      .populate('nurses', 'name');
    if (!surgery) return res.status(404).json({ message: 'Surgery not found' });
    res.json({ surgery });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const surgery = await OTSurgery.create(req.body);
    res.status(201).json({ surgery });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const surgery = await OTSurgery.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!surgery) return res.status(404).json({ message: 'Surgery not found' });
    res.json({ surgery });
  } catch (error) { next(error); }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const updates = { status };
    const now = new Date();
    if (status === 'in-progress') updates.actualStartTime = now;
    if (status === 'completed') updates.actualEndTime = now;
    const surgery = await OTSurgery.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ surgery });
  } catch (error) { next(error); }
};

export const otSchedule = async (req, res, next) => {
  try {
    const { date } = req.query;
    const query = {};
    if (date) query.scheduledDate = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) };
    const surgeries = await OTSurgery.find(query)
      .populate('surgeon', 'user')
      .sort({ scheduledTime: 1 })
      .select('surgeryNo patient surgeon otRoom procedure scheduledDate scheduledTime status');
    const rooms = [...new Set(surgeries.map(s => s.otRoom))];
    res.json({ surgeries, rooms });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const total = await OTSurgery.countDocuments();
    const scheduled = await OTSurgery.countDocuments({ status: 'scheduled' });
    const todaySurgeries = await OTSurgery.countDocuments({ scheduledDate: { $gte: today, $lt: tomorrow } });
    const completed = await OTSurgery.countDocuments({ status: 'completed' });
    res.json({ total, scheduled, todaySurgeries, completed });
  } catch (error) { next(error); }
};
