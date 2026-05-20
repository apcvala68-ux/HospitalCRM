import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Billing from '../models/Billing.js';
import IPDAdmission from '../models/IPDAdmission.js';
import QueueToken from '../models/QueueToken.js';
import PharmacyInventory from '../models/PharmacyInventory.js';

const getDateBounds = (query) => {
  const { startDate, endDate } = query;
  if (startDate && endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1); // tomorrow 00:00 is technically today's end
  return { start, end };
};

export const stats = async (req, res, next) => {
  try {
    const { start, end } = getDateBounds(req.query);
    const duration = end.getTime() - start.getTime();
    
    // For comparisons, calculate previous period
    const prevStart = new Date(start.getTime() - duration);
    const prevEnd = new Date(start.getTime() - 1);

    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments({ isAvailable: true });
    const activeAdmissions = await IPDAdmission.countDocuments({ status: 'active' });

    // Current period
    const todayAppointments = await Appointment.countDocuments({ date: { $gte: start, $lte: end } });
    const todayRevenue = await Billing.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);
    const todayBills = await Billing.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    const waiting = await QueueToken.countDocuments({
      date: { $gte: start, $lte: end },
      status: { $in: ['waiting', 'ready', 'called'] },
    });
    const triage = await QueueToken.countDocuments({
      date: { $gte: start, $lte: end },
      status: 'triage',
    });
    const withDoctor = await QueueToken.countDocuments({
      date: { $gte: start, $lte: end },
      status: 'with-doctor',
    });
    const completedToday = await QueueToken.countDocuments({
      date: { $gte: start, $lte: end },
      status: 'completed',
    });

    // Previous period
    const yesterdayPatients = await Patient.countDocuments({ createdAt: { $gte: prevStart, $lte: prevEnd } });
    const yesterdayRevenue = await Billing.aggregate([
      { $match: { createdAt: { $gte: prevStart, $lte: prevEnd }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } },
    ]);
    const yesterdayAppointments = await Appointment.countDocuments({ date: { $gte: prevStart, $lte: prevEnd } });
    const yesterdayQueue = await QueueToken.countDocuments({ date: { $gte: prevStart, $lte: prevEnd } });

    // Month remains fixed for now as it's a fixed KPI
    const thisMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
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
      triageInQueue: triage,
      withDoctorInQueue: withDoctor,
      completedTodayInQueue: completedToday,
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
    const { start, end } = getDateBounds(req.query);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // If range is large enough, group by month, else group by day or week
    // For simplicity, let's keep it fixed to 12 months from end date as it's meant to be a monthly trend
    const months = 12;
    const now = end;
    const trendStart = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    const patients = await Patient.aggregate([
      { $match: { createdAt: { $gte: trendStart, $lte: end } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const appointments = await Appointment.aggregate([
      { $match: { date: { $gte: trendStart, $lte: end } } },
      { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const revenue = await Billing.aggregate([
      { $match: { createdAt: { $gte: trendStart, $lte: end }, status: { $in: ['paid', 'partial'] } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, total: { $sum: '$amountPaid' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const ipdAdmissions = await IPDAdmission.aggregate([
      { $match: { admissionDate: { $gte: trendStart, $lte: end } } },
      { $group: { _id: { year: { $year: '$admissionDate' }, month: { $month: '$admissionDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const queueTokens = await QueueToken.aggregate([
      { $match: { date: { $gte: trendStart, $lte: end } } },
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
    const { start, end } = getDateBounds(req.query);
    const data = await Billing.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ['paid', 'partial'] } } },
      { $unwind: '$payments' },
      { $group: { _id: '$payments.method', total: { $sum: '$payments.amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    res.json({ breakdown: data.map(d => ({ method: d._id, total: d.total, count: d.count })) });
  } catch (error) { next(error); }
};

export const departmentRevenue = async (req, res, next) => {
  try {
    const { start, end } = getDateBounds(req.query);
    const data = await Billing.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ['paid', 'partial'] } } },
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
    const { start, end } = getDateBounds(req.query);
    const data = await Billing.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$total' } } },
    ]);
    res.json({ statuses: data.map(d => ({ status: d._id || 'unknown', count: d.count, total: d.total })) });
  } catch (error) { next(error); }
};

export const avgWaitTime = async (req, res, next) => {
  try {
    const { start, end } = getDateBounds(req.query);
    const data = await QueueToken.aggregate([
      { $match: { date: { $gte: start, $lte: end }, status: { $in: ['completed', 'called'] } } },
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
    const { start, end } = getDateBounds(req.query);
    const data = await Billing.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ['paid', 'partial'] } } },
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
    const { start, end } = getDateBounds(req.query);
    const data = await QueueToken.aggregate([
      { $match: { date: { $gte: start, $lte: end }, status: { $ne: 'cancelled' } } },
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

export const todayAppointments = async (req, res, next) => {
  try {
    const { start, end } = getDateBounds(req.query);
    const appointments = await Appointment.find({ date: { $gte: start, $lte: end } })
      .populate('patient', 'firstName lastName')
      .populate('doctor')
      .populate({ path: 'doctor', populate: { path: 'department', select: 'name' } })
      .sort({ 'timeSlot.start': 1 })
      .lean();

    const result = appointments.map(a => ({
      _id: a._id,
      patientName: `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`,
      time: a.timeSlot?.start || '',
      department: a.doctor?.department?.name || 'General',
      status: a.status,
      type: a.type,
      date: a.date,
    }));

    res.json({ appointments: result });
  } catch (error) { next(error); }
};

export const patientStats = async (req, res, next) => {
  try {
    const { start, end } = getDateBounds(req.query);

    const patients = await Patient.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        newPatients: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    const returning = await Patient.aggregate([
      { $match: { createdAt: { $lt: start } } },
      { $lookup: {
        from: 'appointments',
        let: { pid: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$patient', '$$pid'] }, date: { $gte: start, $lte: end } } },
          { $limit: 1 },
        ],
        as: 'recentAppt',
      }},
      { $match: { recentAppt: { $ne: [] } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: { $arrayElemAt: ['$recentAppt.date', 0] } } },
        returningPatients: { $sum: 1 },
      }},
      { $sort: { _id: 1 } },
    ]);

    // Create day labels based on start/end range
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dayLabels = [];
    if (diffDays <= 31) {
      for (let i = 0; i < diffDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        dayLabels.push(d.toISOString().split('T')[0]);
      }
    } else {
      // For large ranges, maybe group by week/month, but we'll stick to dates mapped from data if too many
      // Just map from data directly if diffDays > 31 to prevent huge arrays
      const uniqueDates = [...new Set([...patients.map(p => p._id), ...returning.map(p => p._id)])].sort();
      dayLabels.push(...uniqueDates);
    }

    const result = dayLabels.map(day => {
      const newP = patients.find(p => p._id === day);
      const retP = returning.find(p => p._id === day);
      return {
        label: new Date(day).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: diffDays > 31 ? 'short' : undefined }),
        newPatients: newP?.newPatients || 0,
        returningPatients: retP?.returningPatients || 0,
      };
    });

    res.json({ stats: result });
  } catch (error) { next(error); }
};

export const patientVisitsGauge = async (req, res, next) => {
  try {
    // Gauge is typically overall patient demographics, but we can filter if needed.
    const { start, end } = getDateBounds(req.query);
    // Find patients who visited in this timeframe
    const visitedPatients = await Appointment.distinct('patient', { date: { $gte: start, $lte: end } });

    const total = visitedPatients.length || 1; // avoid div by 0
    
    let male = 0, female = 0, other = 0;
    
    if (visitedPatients.length > 0) {
      male = await Patient.countDocuments({ _id: { $in: visitedPatients }, gender: 'male' });
      female = await Patient.countDocuments({ _id: { $in: visitedPatients }, gender: 'female' });
      other = visitedPatients.length - male - female;
    } else {
      // Fallback to all patients if no visits in range (or return 0)
      const t = await Patient.countDocuments();
      if (t > 0) {
        male = await Patient.countDocuments({ gender: 'male' });
        female = await Patient.countDocuments({ gender: 'female' });
        other = t - male - female;
      }
    }

    res.json({
      total: visitedPatients.length || await Patient.countDocuments(),
      male: Math.round((male / (male+female+other || 1)) * 100) || 0,
      female: Math.round((female / (male+female+other || 1)) * 100) || 0,
      other: Math.round((other / (male+female+other || 1)) * 100) || 0,
    });
  } catch (error) { next(error); }
};

export const doctorsAvailability = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name')
      .populate('department', 'name')
      .sort({ isAvailable: -1, 'user.name': 1 })
      .lean();

    const result = doctors.map(d => ({
      _id: d._id,
      name: d.user?.name || 'Unknown',
      specialization: d.specialization,
      department: d.department?.name || 'General',
      isAvailable: d.isAvailable,
    }));

    res.json({ doctors: result });
  } catch (error) { next(error); }
};

export const latestAppointments = async (req, res, next) => {
  try {
    const { start, end } = getDateBounds(req.query);
    const appointments = await Appointment.find({ date: { $gte: start, $lte: end } })
      .populate('patient', 'firstName lastName')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } })
      .sort({ date: -1, 'timeSlot.start': -1 })
      .limit(10)
      .lean();

    const result = appointments.map(a => ({
      _id: a._id,
      patientId: `PT${String(a.patient?._id).slice(-5).toUpperCase()}`,
      patientName: `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`,
      sessionType: a.type === 'opd' ? 'Visit' : a.type === 'follow-up' ? 'Follow-up' : 'Emergency',
      doctorName: `Dr. ${a.doctor?.user?.name || 'Unknown'}`,
      dateTime: a.date ? `${new Date(a.date).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })}, ${a.timeSlot?.start || ''}` : '',
      status: a.status,
    }));

    res.json({ appointments: result });
  } catch (error) { next(error); }
};

export const patientRecords = async (req, res, next) => {
  try {
    const { start, end } = getDateBounds(req.query);
    const Prescription = (await import('../models/Prescription.js')).default;

    const prescriptions = await Prescription.find({ createdAt: { $gte: start, $lte: end } })
      .populate('patient', 'firstName lastName')
      .populate({ path: 'doctor', populate: { path: 'department', select: 'name' } })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const result = prescriptions.map(p => ({
      _id: p._id,
      patientName: `${p.patient?.firstName || ''} ${p.patient?.lastName || ''}`,
      diagnosis: p.diagnosis?.[0]?.description || 'General Checkup',
      department: p.doctor?.department?.name || 'General',
      lastVisit: p.createdAt ? new Date(p.createdAt).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
    }));

    res.json({ records: result });
  } catch (error) { next(error); }
};

export const recentLabResults = async (req, res, next) => {
  try {
    const { start, end } = getDateBounds(req.query);
    const LabOrder = (await import('../models/LabOrder.js')).default;

    const orders = await LabOrder.find({ createdAt: { $gte: start, $lte: end } })
      .populate('patient', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const result = orders.flatMap(o =>
      (o.tests || []).map(t => ({
        _id: `${o._id}-${t.testName}`,
        patientName: `${o.patient?.firstName || ''} ${o.patient?.lastName || ''}`,
        testName: t.testName,
        category: t.category || 'other',
        status: t.status || o.status,
        orderNo: o.orderNo,
      }))
    ).slice(0, 10);

    res.json({ labResults: result });
  } catch (error) { next(error); }
};

export const quickStats = async (req, res, next) => {
  try {
    const { start, end } = getDateBounds(req.query);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dayLabels = [];
    if (diffDays <= 31) {
      for (let i = 0; i < diffDays; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        dayLabels.push(d.toISOString().split('T')[0]);
      }
    }

    const [patients, appointments, revenue] = await Promise.all([
      Patient.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      ]),
      Appointment.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
      ]),
      Billing.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end }, status: { $in: ['paid', 'partial'] } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amountPaid' } } },
      ]),
    ]);

    if (diffDays > 31) {
      const uniqueDates = [...new Set([...patients.map(p => p._id), ...appointments.map(p => p._id), ...revenue.map(p => p._id)])].sort();
      dayLabels.push(...uniqueDates);
    }

    const fill = (data, key) => dayLabels.map(day => {
      const found = data.find(d => d._id === day);
      return { label: new Date(day).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: diffDays > 31 ? 'short' : undefined }), [key]: found ? (found.count ?? found.total ?? 0) : 0 };
    });

    res.json({
      patients: fill(patients, 'value'),
      appointments: fill(appointments, 'value'),
      revenue: fill(revenue, 'value'),
    });
  } catch (error) { next(error); }
};
