import StaffRoster from '../models/StaffRoster.js';

const SORTABLE_FIELDS = ['date', 'shift', 'status', 'department'];

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder, date, department, shift, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { shift: new RegExp(search, 'i') },
        { notes: new RegExp(search, 'i') },
      ];
    }
    if (date) query.date = { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) };
    if (department) query.department = department;
    if (shift) query.shift = shift;
    if (status) query.status = status;
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'date';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const roster = await StaffRoster.find(query)
      .populate('staff', 'name email phone role')
      .populate('department', 'name')
      .populate('swappedWith', 'name')
      .sort({ [sortField]: sortDir })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await StaffRoster.countDocuments(query);
    res.json({ roster, total, page: +page, pages: Math.ceil(total / limit), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const entry = await StaffRoster.findById(req.params.id)
      .populate('staff', 'name email phone role')
      .populate('department', 'name')
      .populate('swappedWith', 'name');
    if (!entry) return res.status(404).json({ message: 'Roster entry not found' });
    res.json({ entry });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const entry = await StaffRoster.create(req.body);
    res.status(201).json({ entry });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Staff already has a roster entry for this date' });
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const entry = await StaffRoster.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!entry) return res.status(404).json({ message: 'Roster entry not found' });
    res.json({ entry });
  } catch (error) { next(error); }
};

export const bulkCreate = async (req, res, next) => {
  try {
    const { entries } = req.body;
    const created = await StaffRoster.insertMany(entries, { ordered: false });
    res.status(201).json({ entries: created, count: created.length });
  } catch (error) { next(error); }
};

export const byDate = async (req, res, next) => {
  try {
    const { date } = req.params;
    const roster = await StaffRoster.find({
      date: { $gte: new Date(date), $lt: new Date(new Date(date).getTime() + 86400000) },
    })
      .populate('staff', 'name email phone role')
      .populate('department', 'name')
      .sort({ shift: 1 });
    const morning = roster.filter(r => r.shift === 'morning');
    const afternoon = roster.filter(r => r.shift === 'afternoon');
    const night = roster.filter(r => r.shift === 'night');
    const general = roster.filter(r => r.shift === 'general');
    res.json({ date, morning, afternoon, night, general, total: roster.length });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const todayRoster = await StaffRoster.find({ date: { $gte: today, $lt: tomorrow } });
    const scheduled = todayRoster.filter(r => r.status === 'scheduled').length;
    const checkedIn = todayRoster.filter(r => r.status === 'checked-in').length;
    const absent = todayRoster.filter(r => r.status === 'absent').length;
    const onLeave = todayRoster.filter(r => r.status === 'on-leave').length;
    res.json({ total: todayRoster.length, scheduled, checkedIn, absent, onLeave });
  } catch (error) { next(error); }
};
