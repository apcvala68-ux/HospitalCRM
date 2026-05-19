import Department from '../models/Department.js';
import Doctor from '../models/Doctor.js';

const SORTABLE_FIELDS = ['name', 'location', 'createdAt', 'doctorCount', 'revenue', 'isActive'];

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { location: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    const total = await Department.countDocuments(query);
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'name';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const departments = await Department.find(query)
      .populate({ path: 'headDoctor', populate: { path: 'user', select: 'name' } })
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));
    const counts = await Doctor.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);
    const result = departments.map(d => ({
      ...d.toObject(),
      doctorCount: counts.find(c => c._id?.toString() === d._id?.toString())?.count || 0,
    }));
    if (sortField === 'doctorCount') {
      result.sort((a, b) => sortDir * (a.doctorCount - b.doctorCount));
    }
    res.json({ departments: result, total, page: Number(page), totalPages: Math.ceil(total / limit) });
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
    await Doctor.updateMany({ department: req.params.id }, { $unset: { department: '' } });
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted' });
  } catch (error) { next(error); }
};

export const assignDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.body;
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    const doctor = await Doctor.findByIdAndUpdate(doctorId, { department: req.params.id }, { new: true }).populate('user', 'name email phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ doctor });
  } catch (error) { next(error); }
};

export const removeDoctor = async (req, res, next) => {
  try {
    const { doctorId } = req.body;
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    if (department.headDoctor?.toString() === doctorId) {
      await Department.findByIdAndUpdate(req.params.id, { $unset: { headDoctor: '' } });
    }
    const doctor = await Doctor.findByIdAndUpdate(doctorId, { $unset: { department: '' } }, { new: true }).populate('user', 'name email phone');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ doctor });
  } catch (error) { next(error); }
};
