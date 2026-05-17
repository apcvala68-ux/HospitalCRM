import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';

export const list = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate({ path: 'headDoctor', populate: { path: 'user', select: 'name' } })
      .sort({ name: 1 });
    const counts = await Doctor.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);
    const result = departments.map(d => ({
      ...d.toObject(),
      doctorCount: counts.find(c => c._id?.toString() === d._id?.toString())?.count || 0,
    }));
    res.json({ departments: result });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate({ path: 'headDoctor', populate: { path: 'user', select: 'name' } });
    if (!department) return res.status(404).json({ message: 'Department not found' });
    const doctors = await Doctor.find({ department: req.params.id })
      .populate('user', 'name email phone');
    res.json({ department, doctors });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ department });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json({ department });
  } catch (error) { next(error); }
};

export const remove = async (req, res, next) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (error) { next(error); }
};
