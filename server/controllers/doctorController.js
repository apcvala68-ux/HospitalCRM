import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

export const getMyProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', 'name email phone')
      .populate('department', 'name');
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json({ doctor });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('department', 'name');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ doctor });
  } catch (error) {
    next(error);
  }
};

export const list = async (req, res, next) => {
  try {
    const { department, specialization } = req.query;
    const query = { isAvailable: true };
    if (department) query.department = department;
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    const doctors = await Doctor.find(query)
      .populate('user', 'name email phone')
      .populate('department', 'name');
    res.json({ doctors });
  } catch (error) {
    next(error);
  }
};

export const getMyAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const { status, date, page = 1, limit = 20 } = req.query;
    const query = { doctor: doctor._id };
    if (status) query.status = status;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }

    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName uhid phone gender bloodGroup')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ appointments, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};
