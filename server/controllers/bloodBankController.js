import BloodBank from '../models/BloodBank.js';

const SORTABLE_FIELDS = ['createdAt', 'entryNo', 'bloodGroup', 'status', 'type', 'quantity'];

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder, bloodGroup, status, type } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { entryNo: new RegExp(search, 'i') },
        { donorName: new RegExp(search, 'i') },
        { donorPhone: new RegExp(search, 'i') },
      ];
    }
    if (bloodGroup) query.bloodGroup = bloodGroup;
    if (status) query.status = status;
    if (type) query.type = type;
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const entries = await BloodBank.find(query)
      .populate('patient', 'firstName lastName uhid')
      .populate('issuedTo', 'user')
      .populate('createdBy', 'name')
      .sort({ [sortField]: sortDir })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await BloodBank.countDocuments(query);
    res.json({ entries, total, page: +page, pages: Math.ceil(total / limit), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const entry = await BloodBank.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone age gender')
      .populate('issuedTo', 'user')
      .populate('createdBy', 'name');
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ entry });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const entry = await BloodBank.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ entry });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const entry = await BloodBank.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ entry });
  } catch (error) { next(error); }
};

export const inventory = async (req, res, next) => {
  try {
    const data = await BloodBank.aggregate([
      { $match: { status: { $in: ['stored', 'collected'] } } },
      { $group: { _id: '$bloodGroup', total: { $sum: '$quantity' } } },
      { $sort: { _id: 1 } },
    ]);
    const total = data.reduce((sum, d) => sum + d.total, 0);
    const expiring = await BloodBank.countDocuments({
      status: { $in: ['stored', 'collected'] },
      expiryDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    });
    res.json({ inventory: data.map(d => ({ bloodGroup: d._id, units: d.total })), total, expiring });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const total = await BloodBank.countDocuments();
    const stored = await BloodBank.countDocuments({ status: 'stored' });
    const todayDonations = await BloodBank.countDocuments({ type: 'donation', createdAt: { $gte: today, $lt: tomorrow } });
    const todayIssues = await BloodBank.countDocuments({ type: 'issue', createdAt: { $gte: today, $lt: tomorrow } });
    res.json({ total, stored, todayDonations, todayIssues });
  } catch (error) { next(error); }
};
