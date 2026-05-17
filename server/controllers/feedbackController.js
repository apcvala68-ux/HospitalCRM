import Feedback from '../models/Feedback.js';

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, category } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (category) query.category = category;
    const feedbacks = await Feedback.find(query)
      .populate('patient', 'firstName lastName uhid')
      .populate('department', 'name')
      .populate('staff assignedTo resolvedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Feedback.countDocuments(query);
    res.json({ feedbacks, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const feedback = await Feedback.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone')
      .populate('department', 'name')
      .populate('staff assignedTo resolvedBy', 'name');
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ feedback });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const feedback = await Feedback.create(req.body);
    res.status(201).json({ feedback });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });
    res.json({ feedback });
  } catch (error) { next(error); }
};

export const resolve = async (req, res, next) => {
  try {
    const { resolution } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(req.params.id, {
      resolution,
      status: 'resolved',
      resolvedAt: new Date(),
      resolvedBy: req.user._id,
    }, { new: true });
    res.json({ feedback });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const total = await Feedback.countDocuments();
    const open = await Feedback.countDocuments({ status: 'open' });
    const resolved = await Feedback.countDocuments({ status: 'resolved' });
    const complaints = await Feedback.countDocuments({ type: 'complaint' });
    const avgRating = await Feedback.aggregate([
      { $match: { rating: { $exists: true } } },
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);
    res.json({ total, open, resolved, complaints, avgRating: avgRating[0]?.avg?.toFixed(1) || 0 });
  } catch (error) { next(error); }
};
