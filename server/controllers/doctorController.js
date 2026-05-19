import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';

const SORTABLE_FIELDS = ['createdAt', 'specialization', 'consultationFee', 'yearsOfExperience', 'isAvailable'];

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder, department, specialization, isAvailable } = req.query;
    const query = {};
    if (isAvailable !== undefined) query.isAvailable = isAvailable === 'true';
    if (department) query.department = department;
    if (specialization) query.specialization = new RegExp(specialization, 'i');
    if (search) {
      const userIds = await User.find({
        $or: [
          { name: new RegExp(search, 'i') },
          { email: new RegExp(search, 'i') },
          { phone: new RegExp(search, 'i') },
        ],
      }).distinct('_id');
      query.$or = [
        { user: { $in: userIds } },
        { specialization: new RegExp(search, 'i') },
        { licenseNo: new RegExp(search, 'i') },
      ];
    }
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const total = await Doctor.countDocuments(query);
    const doctors = await Doctor.find(query)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name')
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ doctors, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email phone avatar isActive')
      .populate('department', 'name');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ doctor });
  } catch (error) { next(error); }
};

export const getMyProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', 'name email phone avatar')
      .populate('department', 'name');
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json({ doctor });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const { name, email, password, phone, specialization, licenseNo, department, consultationFee, qualifications, yearsOfExperience, gender, dateOfBirth, address, bio, languages, emergencyContact, schedule, isAvailable } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });
    const existingLicense = await Doctor.findOne({ licenseNo });
    if (existingLicense) return res.status(400).json({ message: 'License number already exists' });
    const user = await User.create({ name, email, password, phone, role: 'doctor', isActive: true });
    const doctor = await Doctor.create({
      user: user._id, specialization, licenseNo, department, consultationFee, qualifications,
      yearsOfExperience, gender, dateOfBirth, address, bio, languages, emergencyContact, schedule, isAvailable,
    });
    const populated = await Doctor.findById(doctor._id)
      .populate('user', 'name email phone avatar')
      .populate('department', 'name');
    res.status(201).json({ doctor: populated });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const { name, email, phone, specialization, licenseNo, department, consultationFee, qualifications, yearsOfExperience, gender, dateOfBirth, address, bio, languages, emergencyContact, schedule, isAvailable } = req.body;
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (licenseNo && licenseNo !== doctor.licenseNo) {
      const existingLicense = await Doctor.findOne({ licenseNo, _id: { $ne: doctor._id } });
      if (existingLicense) return res.status(400).json({ message: 'License number already in use' });
    }
    if (name || email || phone) {
      const updates = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      if (phone) updates.phone = phone;
      if (Object.keys(updates).length) await User.findByIdAndUpdate(doctor.user, updates, { new: true });
    }
    const updates = {};
    if (specialization !== undefined) updates.specialization = specialization;
    if (licenseNo !== undefined) updates.licenseNo = licenseNo;
    if (department !== undefined) updates.department = department;
    if (consultationFee !== undefined) updates.consultationFee = consultationFee;
    if (qualifications !== undefined) updates.qualifications = qualifications;
    if (yearsOfExperience !== undefined) updates.yearsOfExperience = yearsOfExperience;
    if (gender !== undefined) updates.gender = gender;
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
    if (address !== undefined) updates.address = address;
    if (bio !== undefined) updates.bio = bio;
    if (languages !== undefined) updates.languages = languages;
    if (emergencyContact !== undefined) updates.emergencyContact = emergencyContact;
    if (schedule !== undefined) updates.schedule = schedule;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;
    const updated = await Doctor.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('user', 'name email phone avatar')
      .populate('department', 'name');
    res.json({ doctor: updated });
  } catch (error) { next(error); }
};

export const remove = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await User.findByIdAndUpdate(doctor.user._id, { isActive: false });
    await Doctor.findByIdAndUpdate(req.params.id, { isAvailable: false });
    res.json({ message: 'Doctor deactivated successfully' });
  } catch (error) { next(error); }
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
  } catch (error) { next(error); }
};
