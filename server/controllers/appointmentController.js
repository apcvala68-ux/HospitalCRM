import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

const SORTABLE_FIELDS = ['createdAt', 'date', 'status', 'timeSlot.start'];
const ALLOWED_UPDATE_FIELDS = ['date', 'timeSlot', 'status', 'type', 'reason', 'notes'];
const STATUS_COLORS = {
  scheduled: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#ef4444',
  'checked-in': '#3b82f6',
  'no-show': '#8b5cf6',
};

function autoMarkMissed() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Appointment.updateMany(
    { date: { $lt: today }, status: { $in: ['scheduled', 'confirmed'] } },
    { status: 'no-show' }
  );
}

function getHour(timeStr) {
  return timeStr ? timeStr.split(':')[0] : null;
}

async function checkSlotAvailability({ doctorId, date, start, end, excludeId }) {
  const doctor = await Doctor.findById(doctorId).select('maxPatientsPerHour');
  if (!doctor) return { ok: false, message: 'Doctor not found' };

  const maxSlots = doctor.maxPatientsPerHour || 2;
  const hour = getHour(start);

  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const matchFilter = {
    _id: { $ne: excludeId },
    doctor: doctorId,
    date: { $gte: dayStart, $lt: dayEnd },
    status: { $nin: ['cancelled', 'completed', 'no-show'] },
  };

  const totalInSameHour = await Appointment.countDocuments({
    ...matchFilter,
    'timeSlot.start': { $regex: `^${hour}:` },
  });

  if (totalInSameHour >= maxSlots) {
    return {
      ok: false,
      message: `This doctor can only take ${maxSlots} patients per hour. Hour ${hour}:00 is full.`,
    };
  }

  return { ok: true };
}

export const list = async (req, res, next) => {
  try {
    await autoMarkMissed();

    const { page = 1, limit = 20, search, sortBy, sortOrder, status, doctor, patient, date } = req.query;
    const query = {};
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      query.$or = [
        { reason: searchRegex },
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
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' }, select: 'specialization maxPatientsPerHour' })
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
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' }, select: 'specialization consultationFee maxPatientsPerHour' })
      .populate('createdBy', 'name');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ appointment });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const { patient, doctor: doctorId, date, timeSlot } = req.body;

    if (!patient || !doctorId || !date || !timeSlot?.start || !timeSlot?.end) {
      return res.status(400).json({ message: 'Missing required fields: patient, doctor, date, timeSlot.start, timeSlot.end' });
    }

    const availability = await checkSlotAvailability({ doctorId, date, start: timeSlot.start, end: timeSlot.end, excludeId: null });
    if (!availability.ok) {
      return res.status(409).json({ message: availability.message });
    }

    const appointment = await Appointment.create({ ...req.body, createdBy: req.user._id });
    const populated = await Appointment.findById(appointment._id)
      .populate('patient', 'firstName lastName uhid phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' }, select: 'specialization maxPatientsPerHour' });
    res.status(201).json({ appointment: populated });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const updates = {};
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (updates.date || updates.timeSlot) {
      const availability = await checkSlotAvailability({
        doctorId: updates.doctor || appointment.doctor,
        date: updates.date || appointment.date,
        start: updates.timeSlot?.start || appointment.timeSlot.start,
        end: updates.timeSlot?.end || appointment.timeSlot.end,
        excludeId: appointment._id,
      });
      if (!availability.ok) {
        return res.status(409).json({ message: availability.message });
      }
    }

    const updated = await Appointment.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('patient', 'firstName lastName uhid phone')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' }, select: 'specialization maxPatientsPerHour' });
    res.json({ appointment: updated });
  } catch (error) { next(error); }
};

export const cancel = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    if (appointment.status === 'cancelled') return res.status(400).json({ message: 'Appointment is already cancelled' });
    if (appointment.status === 'completed') return res.status(400).json({ message: 'Cannot cancel a completed appointment' });

    appointment.status = 'cancelled';
    await appointment.save();
    res.json({ appointment });
  } catch (error) { next(error); }
};

export const calendarEvents = async (req, res, next) => {
  try {
    await autoMarkMissed();

    const { start, end, doctor } = req.query;
    const query = {};
    if (start && end) {
      query.date = { $gte: new Date(start), $lte: new Date(end) };
    }
    if (doctor) query.doctor = doctor;
    const appointments = await Appointment.find(query)
      .populate('patient', 'firstName lastName uhid')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' }, select: 'specialization maxPatientsPerHour' })
      .sort({ date: 1, 'timeSlot.start': 1 });

    const events = appointments.map(a => {
      const dateStr = a.date ? a.date.toISOString().split('T')[0] : '';
      return {
        id: a._id,
        title: `${a.patient?.firstName || '?'} ${a.patient?.lastName || '?'} - ${a.doctor?.user?.name || 'Dr.'}`,
        start: dateStr ? new Date(`${dateStr}T${a.timeSlot?.start || '09:00'}`) : new Date(),
        end: dateStr ? new Date(`${dateStr}T${a.timeSlot?.end || '09:30'}`) : new Date(),
        backgroundColor: STATUS_COLORS[a.status] || '#f59e0b',
        borderColor: STATUS_COLORS[a.status] || '#f59e0b',
        extendedProps: { status: a.status, patient: a.patient, doctor: a.doctor },
      };
    });

    const dayStart = start ? new Date(start) : new Date();
    const dayEnd = end ? new Date(end) : new Date();
    const availabilityByDay = [];

    if (doctor) {
      const doc = await Doctor.findById(doctor).select('maxPatientsPerHour');
      const maxSlots = doc?.maxPatientsPerHour || 2;
      let cursor = new Date(dayStart);
      while (cursor <= dayEnd) {
        const dayStr = cursor.toISOString().split('T')[0];
        const hours = {};
        for (let h = 8; h < 18; h++) {
          const hourStr = String(h).padStart(2, '0');
          const count = appointments.filter(a => {
            if (!a.date) return false;
            const d = a.date.toISOString().split('T')[0];
            return d === dayStr && getHour(a.timeSlot?.start) === hourStr;
          }).length;
          hours[hourStr] = { booked: count, max: maxSlots };
        }
        availabilityByDay.push({ date: dayStr, hours });
        cursor.setDate(cursor.getDate() + 1);
      }
    }

    res.json({ events, availabilityByDay });
  } catch (error) { next(error); }
};
