import Mortuary from '../models/Mortuary.js';

const SORTABLE_FIELDS = ['createdAt', 'patient', 'status', 'deathCertificateNo'];

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder, status } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { 'patient': new RegExp(search, 'i') },
        { deathCertificateNo: new RegExp(search, 'i') },
        { causeOfDeath: new RegExp(search, 'i') },
      ];
    }
    if (status) query.status = status;
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const records = await Mortuary.find(query)
      .populate('patient', 'firstName lastName uhid')
      .populate('declaredBy', 'user')
      .sort({ [sortField]: sortDir })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await Mortuary.countDocuments(query);
    res.json({ records, total, page: +page, pages: Math.ceil(total / limit), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const record = await Mortuary.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone age gender')
      .populate('declaredBy', 'user');
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ record });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const record = await Mortuary.create(req.body);
    res.status(201).json({ record });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const record = await Mortuary.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json({ record });
  } catch (error) { next(error); }
};

export const handover = async (req, res, next) => {
  try {
    const { name, relation, phone, idProof } = req.body;
    const record = await Mortuary.findByIdAndUpdate(req.params.id, {
      handedOverTo: { name, relation, phone, idProof },
      handedOverAt: new Date(),
    }, { new: true });
    res.json({ record });
  } catch (error) { next(error); }
};

export const issueDeathCertificate = async (req, res, next) => {
  try {
    const { deathCertificateNo } = req.body;
    const record = await Mortuary.findByIdAndUpdate(req.params.id, {
      deathCertificateNo,
      deathCertificateIssued: true,
    }, { new: true });
    res.json({ record });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    const total = await Mortuary.countDocuments();
    const inMortuary = await Mortuary.countDocuments({ handedOverAt: null });
    const todayEntries = await Mortuary.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } });
    res.json({ total, inMortuary, todayEntries });
  } catch (error) { next(error); }
};
