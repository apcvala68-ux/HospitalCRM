import Housekeeping from '../models/Housekeeping.js';

const SORTABLE_FIELDS = ['createdAt', 'status', 'type', 'priority', 'location'];

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder, status, type, priority } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { location: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
      ];
    }
    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const tickets = await Housekeeping.find(query)
      .populate('ward', 'name')
      .populate('bed', 'bedNo roomNo')
      .populate('assignedTo assignedBy', 'name')
      .sort({ [sortField]: sortDir })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Housekeeping.countDocuments(query);
    res.json({ tickets, total, page: +page, pages: Math.ceil(total / limit), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const ticket = await Housekeeping.findById(req.params.id)
      .populate('ward', 'name')
      .populate('bed', 'bedNo roomNo ward')
      .populate('assignedTo assignedBy', 'name');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ ticket });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const ticket = await Housekeeping.create({ ...req.body, assignedBy: req.user._id });
    res.status(201).json({ ticket });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const ticket = await Housekeeping.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json({ ticket });
  } catch (error) { next(error); }
};

export const assign = async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const ticket = await Housekeeping.findByIdAndUpdate(req.params.id, {
      assignedTo,
      status: 'assigned',
      assignedAt: new Date(),
    }, { new: true });
    res.json({ ticket });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const total = await Housekeeping.countDocuments();
    const open = await Housekeeping.countDocuments({ status: 'open' });
    const todayTickets = await Housekeeping.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });
    const completed = await Housekeeping.countDocuments({ status: 'completed' });
    res.json({ total, open, todayTickets, completed });
  } catch (error) { next(error); }
};
