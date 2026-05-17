import Attendance from '../models/Attendance.js';
import User from '../models/User.js';

export const checkIn = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await Attendance.findOne({ user: req.user._id, date: today });
    if (existing) {
      return res.status(400).json({ message: 'Already checked in today' });
    }
    const hours = today.getHours();
    const shift = hours < 12 ? 'morning' : hours < 17 ? 'evening' : 'night';
    const attendance = await Attendance.create({
      user: req.user._id,
      date: today,
      shift: req.body.shift || shift,
      checkIn: new Date(),
      status: 'present',
      markedBy: req.user._id,
    });
    const populated = await Attendance.findById(attendance._id).populate('user', 'name email role');
    res.status(201).json({ attendance: populated });
  } catch (error) { next(error); }
};

export const checkOut = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const attendance = await Attendance.findOne({ user: req.user._id, date: today, checkOut: null });
    if (!attendance) return res.status(400).json({ message: 'No active check-in found' });
    attendance.checkOut = new Date();
    await attendance.save();
    res.json({ attendance });
  } catch (error) { next(error); }
};

export const todayAttendance = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const records = await Attendance.find({ date: today })
      .populate('user', 'name email role')
      .sort({ checkIn: -1 });
    const total = await User.countDocuments({ isActive: true });
    res.json({ records, totalStaff: total, presentToday: records.length });
  } catch (error) { next(error); }
};

export const list = async (req, res, next) => {
  try {
    const { date, userId, page = 1, limit = 50 } = req.query;
    const query = {};
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      query.date = d;
    }
    if (userId) query.user = userId;
    const records = await Attendance.find(query)
      .populate('user', 'name email role')
      .sort({ date: -1, checkIn: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Attendance.countDocuments(query);
    res.json({ records, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const markAttendance = async (req, res, next) => {
  try {
    const { userId, date, status, shift, notes } = req.body;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    let attendance = await Attendance.findOne({ user: userId, date: d });
    if (attendance) {
      attendance.status = status;
      attendance.shift = shift || attendance.shift;
      attendance.notes = notes || attendance.notes;
      await attendance.save();
    } else {
      attendance = await Attendance.create({ user: userId, date: d, status, shift, notes, markedBy: req.user._id });
    }
    res.json({ attendance });
  } catch (error) { next(error); }
};
