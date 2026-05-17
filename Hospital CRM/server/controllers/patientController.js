import Patient from '../models/Patient.js';

const generateUHID = async () => {
  const now = new Date();
  const prefix = `HOSP-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-`;
  const lastPatient = await Patient.findOne({ uhid: new RegExp(`^${prefix}`) })
    .sort({ uhid: -1 })
    .select('uhid');
  let nextNum = 1;
  if (lastPatient) {
    const lastNum = parseInt(lastPatient.uhid.split('-')[2], 10);
    nextNum = lastNum + 1;
  }
  return `${prefix}${String(nextNum).padStart(5, '0')}`;
};

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, gender, bloodGroup } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') },
        { uhid: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }
    if (gender) query.gender = gender;
    if (bloodGroup) query.bloodGroup = bloodGroup;

    const total = await Patient.countDocuments(query);
    const patients = await Patient.find(query)
      .populate('registeredBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ patients, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('registeredBy', 'name');
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ patient });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const existing = await Patient.findOne({ phone: req.body.phone });
    if (existing) {
      return res.status(400).json({ message: 'Patient with this phone already exists', existingPatient: existing });
    }
    const uhid = await generateUHID();
    const patient = await Patient.create({ ...req.body, uhid, registeredBy: req.user._id });
    res.status(201).json({ patient });
  } catch (error) {
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ patient });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json({ message: 'Patient deleted' });
  } catch (error) {
    next(error);
  }
};

export const quickSearch = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ patients: [] });
    const patients = await Patient.find({
      $or: [
        { firstName: new RegExp(q, 'i') },
        { lastName: new RegExp(q, 'i') },
        { phone: new RegExp(q, 'i') },
        { uhid: new RegExp(q, 'i') },
      ],
    }).limit(10).select('firstName lastName uhid phone gender bloodGroup');
    res.json({ patients });
  } catch (error) {
    next(error);
  }
};
