import NursingMAR from '../models/NursingMAR.js';

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, patient, status } = req.query;
    const query = {};
    if (patient) query.patient = patient;
    if (status) query.status = status;
    const records = await NursingMAR.find(query)
      .populate('patient', 'firstName lastName uhid')
      .populate('admission', 'admissionNo ward bedNo')
      .populate('prescription', 'prescriptionNo')
      .populate('administrations.administeredBy discontinuedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await NursingMAR.countDocuments(query);
    res.json({ records, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const record = await NursingMAR.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone age gender')
      .populate('admission', 'admissionNo ward bedNo')
      .populate('prescription', 'prescriptionNo')
      .populate('administrations.administeredBy discontinuedBy', 'name');
    if (!record) return res.status(404).json({ message: 'MAR record not found' });
    res.json({ record });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const record = await NursingMAR.create(req.body);
    res.status(201).json({ record });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const record = await NursingMAR.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ message: 'MAR record not found' });
    res.json({ record });
  } catch (error) { next(error); }
};

export const administer = async (req, res, next) => {
  try {
    const { scheduledTime, dose, status, remarks, vitals } = req.body;
    const record = await NursingMAR.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'MAR record not found' });
    record.administrations.push({
      scheduledTime,
      administeredAt: new Date(),
      administeredBy: req.user._id,
      dose,
      status: status || 'given',
      remarks,
      vitals,
    });
    await record.save();
    res.json({ record });
  } catch (error) { next(error); }
};

export const discontinue = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const record = await NursingMAR.findByIdAndUpdate(req.params.id, {
      status: 'discontinued',
      endDate: new Date(),
      discontinuedBy: req.user._id,
      discontinuedReason: reason,
    }, { new: true });
    res.json({ record });
  } catch (error) { next(error); }
};

export const byPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const records = await NursingMAR.find({ patient: patientId })
      .populate('patient', 'firstName lastName uhid')
      .populate('administrations.administeredBy', 'name')
      .sort({ startDate: -1 });
    res.json({ records });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const total = await NursingMAR.countDocuments();
    const active = await NursingMAR.countDocuments({ status: 'active' });
    const todayAdministered = await NursingMAR.countDocuments({
      'administrations.administeredAt': { $gte: new Date(new Date().setHours(0,0,0,0)) },
    });
    const missed = await NursingMAR.countDocuments({
      'administrations.status': 'missed',
    });
    res.json({ total, active, todayAdministered, missed });
  } catch (error) { next(error); }
};
