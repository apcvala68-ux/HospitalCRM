import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Billing from '../models/Billing.js';
import IPDAdmission from '../models/IPDAdmission.js';
import QueueToken from '../models/QueueToken.js';
import PharmacyInventory from '../models/PharmacyInventory.js';

export const stats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments({ isAvailable: true });
    const todayAppointments = await Appointment.countDocuments({ date: { $gte: today, $lt: tomorrow } });
    const activeAdmissions = await IPDAdmission.countDocuments({ status: 'active' });

    const todayRevenue = await Billing.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);

    const todayBills = await Billing.aggregate([
      { $match: { createdAt: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const waiting = await QueueToken.countDocuments({
      date: { $gte: today },
      status: 'waiting',
    });

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(today);
    const yesterdayPatients = await Patient.countDocuments({ createdAt: { $gte: yesterday, $lt: yesterdayEnd } });
    const yesterdayRevenue = await Billing.aggregate([
      { $match: { createdAt: { $gte: yesterday, $lt: yesterdayEnd }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);
    const yesterdayAppointments = await Appointment.countDocuments({ date: { $gte: yesterday, $lt: yesterdayEnd } });
    const yesterdayQueue = await QueueToken.countDocuments({ date: { $gte: yesterday, $lt: yesterdayEnd } });

    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthPatients = await Patient.countDocuments({ createdAt: { $gte: thisMonthStart } });
    const monthRevenue = await Billing.aggregate([
      { $match: { createdAt: { $gte: thisMonthStart }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);

    res.json({
      totalPatients,
      totalDoctors,
      todayAppointments,
      activeAdmissions,
      todayRevenue: todayRevenue[0]?.total || 0,
      todayBilled: todayBills[0]?.total || 0,
      waitingInQueue: waiting,
      yesterdayPatients,
      yesterdayRevenue: yesterdayRevenue[0]?.total || 0,
      yesterdayAppointments,
      yesterdayQueue,
      monthPatients,
      monthRevenue: monthRevenue[0]?.total || 0,
    });
  } catch (error) { next(error); }
};

export const monthlyTrends = async (req, res, next) => {
  try {
    const months = 12;
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const patients = await Patient.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const appointments = await Appointment.aggregate([
      { $match: { date: { $gte: start } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const revenue = await Billing.aggregate([
      { $match: { createdAt: { $gte: start }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const ipdAdmissions = await IPDAdmission.aggregate([
      { $match: { admissionDate: { $gte: start } } },
      { $group: { _id: { year: { $year: '$admissionDate' }, month: { $month: '$admissionDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const queueTokens = await QueueToken.aggregate([
      { $match: { date: { $gte: start } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthLabels = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthLabels.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('en', { month: 'short', year: '2-digit' }) });
    }

    const fill = (data, key) => monthLabels.map(ml => {
      const found = data.find(d => d._id.year === ml.year && d._id.month === ml.month);
      return { label: ml.label, [key]: found ? (found.count ?? found.total ?? 0) : 0 };
    });

    res.json({
      patients: fill(patients, 'patients'),
      appointments: fill(appointments, 'appointments'),
      revenue: fill(revenue, 'revenue'),
      ipd: fill(ipdAdmissions, 'ipd'),
      queue: fill(queueTokens, 'queue'),
    });
  } catch (error) { next(error); }
};

export const paymentBreakdown = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const data = await Billing.aggregate([
      { $match: { createdAt: { $gte: today }, status: { $in: ['paid', 'partial'] } } },
      { $unwind: '$payments' },
      { $group: { _id: '$payments.method', total: { $sum: '$payments.amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    res.json({ breakdown: data.map(d => ({ method: d._id, total: d.total, count: d.count })) });
  } catch (error) { next(error); }
};

export const departmentRevenue = async (req, res, next) => {
  try {
    const data = await Billing.aggregate([
      { $match: { status: { $in: ['paid', 'partial'] } } },
      { $lookup: { from: 'doctors', localField: 'doctor', foreignField: '_id', as: 'doc' } },
      { $unwind: { path: '$doc', preserveNullAndEmptyArrays: true } },
      { $lookup: { from: 'departments', localField: 'doc.department', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $group: { _id: { $ifNull: ['$dept.name', 'General'] }, total: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]);
    res.json({ departments: data.map(d => ({ name: d._id, revenue: d.total, count: d.count })) });
  } catch (error) { next(error); }
};

export const billingStatus = async (req, res, next) => {
  try {
    const data = await Billing.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } },
    ]);
    res.json({ statuses: data.map(d => ({ status: d._id || 'unknown', count: d.count, total: d.total })) });
  } catch (error) { next(error); }
};

export const avgWaitTime = async (req, res, next) => {
  try {
    const days = 30;
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const data = await QueueToken.aggregate([
      { $match: { date: { $gte: start }, status: { $in: ['completed', 'called'] } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
        avgWait: { $avg: { $subtract: ['$calledAt', '$createdAt'] } },
        count: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    res.json({ waitTimes: data.map(d => ({ date: d._id, avgMinutes: Math.round((d.avgWait || 0) / 60000), count: d.count })) });
  } catch (error) { next(error); }
};

export const revenueTrend = async (req, res, next) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const data = await Billing.aggregate([
      { $match: { createdAt: { $gte: start }, status: { $in: ['paid', 'partial'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amountPaid' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ trend: data.map(d => ({ date: d._id, revenue: d.revenue, count: d.count })) });
  } catch (error) { next(error); }
};

export const doctorPerformance = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = await QueueToken.aggregate([
      { $match: { date: { $gte: today }, status: { $ne: 'cancelled' } } },
      { $group: { _id: '$doctor', total: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } } } },
      { $sort: { total: -1 } },
    ]);

    const doctors = await Doctor.find({ _id: { $in: data.map(d => d._id) } })
      .populate('user', 'name');

    const result = data.map(d => {
      const doc = doctors.find(dd => dd._id.toString() === d._id.toString());
      return {
        doctor: doc?.user?.name || 'Unknown',
        total: d.total,
        completed: d.completed,
      };
    });

    res.json({ performance: result });
  } catch (error) { next(error); }
};

export const bedOccupancy = async (req, res, next) => {
  try {
    const Bed = (await import('../models/Bed.js')).default;
    const total = await Bed.countDocuments();
    const occupied = await Bed.countDocuments({ status: 'occupied' });
    const available = await Bed.countDocuments({ status: 'available' });
    const dirty = await Bed.countDocuments({ status: 'dirty' });
    const maintenance = await Bed.countDocuments({ status: 'maintenance' });
    res.json({ total, occupied, available, dirty, maintenance, occupancyRate: Math.round((occupied / total) * 100) });
  } catch (error) { next(error); }
};
