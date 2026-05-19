import Appointment from '../models/Appointment.js';

const SORTABLE_FIELDS = ['createdAt', 'date', 'status', 'timeSlot.start'];

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder, status, doctor, patient, date } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { reason: new RegExp(search, 'i') },
      ];
    }
    if (status) query.status = status;
    if (doctor) query.doctor = doctor;
    if (patient) query.patient = patient;
    if (date) {
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      query.date = { $gte: d, $lt: next };
    }
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const total = await Appointment.countDocuments(query);
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName uhid phone gender')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' }, select: 'specialization' })
      .sort({ [sortField]: sortDir })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ appointments, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone gender bloodGroup')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' }, select: 'specialization consultationFee' })
      .populate('createdBy', 'name');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ appointment });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const appointment = await Appointment.create({ ...req.body, createdBy: req.user._id });
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName uhid phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });
    res.status(201).json({ appointment: populated });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ appointment });
  } catch (error) { next(error); }
};

export const cancel = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ appointment });
  } catch (error) { next(error); }
};

export const calendarEvents = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    const query = {};
    if (start && end) {
      query.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName uhid')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' }, select: 'specialization' })
      .sort({ date: 1, 'timeSlot.start': 1 });

    const events = appointments.map(a => ({
      id: a._id,
      title: `${a.patient?.firstName} ${a.patient?.lastName} - ${a.doctor?.user?.name || 'Dr.'}`,
      start: new Date(`${a.date.toISOString().split('T')[0]}T${a.timeSlot?.start || '09:00'}`),
      end: new Date(`${a.date.toISOString().split('T')[0]}T${a.timeSlot?.end || '09:30'}`),
      backgroundColor: a.status === 'cancelled' ? '#ef4444' : a.status === 'completed' ? '#22c55e' : a.status === 'confirmed' ? '#3b82f6' : '#f59e0b',
      extendedProps: { status: a.status, patient: a.patient, doctor: a.doctor },
    }));
    res.json({ events });
  } catch (error) { next(error); }
};
