import Vitals from '../models/Vitals.js';
import QueueToken from '../models/QueueToken.js';

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, patient } = req.query;
    const query = {};
    if (patient) query.patient = patient;
    const vitals = await Vitals.find(query)
      .populate('patient', 'firstName lastName uhid')
      .populate('token', 'tokenNo')
      .populate('recordedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Vitals.countDocuments(query);
    res.json({ vitals, total, page: +page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const { patient, token, ...vitalData } = req.body;
    const vital = await Vitals.create({
      patient,
      token,
      ...vitalData,
      recordedBy: req.user._id,
    });
    if (token) {
      await QueueToken.findByIdAndUpdate(token, { status: 'ready' });
    }
    res.status(201).json({ vital });
  } catch (error) { next(error); }
};

export const latestByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const vital = await Vitals.findOne({ patient: patientId }).sort({ createdAt: -1 })
      .populate('patient', 'firstName lastName uhid')
      .populate('recordedBy', 'name');
    res.json({ vital });
  } catch (error) { next(error); }
};

export const byToken = async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const vital = await Vitals.findOne({ token: tokenId })
      .populate('patient', 'firstName lastName uhid')
      .populate('recordedBy', 'name');
    res.json({ vital });
  } catch (error) { next(error); }
};
