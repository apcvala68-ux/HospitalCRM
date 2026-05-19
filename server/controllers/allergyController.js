import Allergy from '../models/Allergy.js';

const SORTABLE_FIELDS = ['createdAt', 'type', 'severity', 'substance', 'reaction'];

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder, patient, type, severity } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { substance: new RegExp(search, 'i') },
        { reaction: new RegExp(search, 'i') },
        { type: new RegExp(search, 'i') },
      ];
    }
    if (patient) query.patient = patient;
    if (type) query.type = type;
    if (severity) query.severity = severity;
    query.isActive = true;
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const allergies = await Allergy.find(query)
      .populate('patient', 'firstName lastName uhid')
      .populate('diagnosedBy', 'user')
      .sort({ [sortField]: sortDir })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Allergy.countDocuments(query);
    res.json({ allergies, total, page: +page, pages: Math.ceil(total / limit), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const allergy = await Allergy.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone')
      .populate('diagnosedBy', 'user');
    if (!allergy) return res.status(404).json({ message: 'Allergy not found' });
    res.json({ allergy });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const allergy = await Allergy.create(req.body);
    res.status(201).json({ allergy });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Allergy already exists for this patient' });
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const allergy = await Allergy.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!allergy) return res.status(404).json({ message: 'Allergy not found' });
    res.json({ allergy });
  } catch (error) { next(error); }
};

export const remove = async (req, res, next) => {
  try {
    const allergy = await Allergy.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!allergy) return res.status(404).json({ message: 'Allergy not found' });
    res.json({ allergy });
  } catch (error) { next(error); }
};

export const byPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const allergies = await Allergy.find({ patient: patientId, isActive: true })
      .populate('diagnosedBy', 'user')
      .sort({ severity: 1 });
    res.json({ allergies });
  } catch (error) { next(error); }
};

export const checkDrug = async (req, res, next) => {
  try {
    const { patientId, drugName } = req.query;
    const allergies = await Allergy.find({
      patient: patientId,
      isActive: true,
      type: 'drug',
      substance: new RegExp(drugName, 'i'),
    });
    if (allergies.length > 0) {
      return res.json({ hasAllergy: true, allergies });
    }
    res.json({ hasAllergy: false, allergies: [] });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const total = await Allergy.countDocuments({ isActive: true });
    const drug = await Allergy.countDocuments({ type: 'drug', isActive: true });
    const food = await Allergy.countDocuments({ type: 'food', isActive: true });
    const severe = await Allergy.countDocuments({ severity: { $in: ['severe', 'life-threatening'] }, isActive: true });
    res.json({ total, drug, food, severe });
  } catch (error) { next(error); }
};
