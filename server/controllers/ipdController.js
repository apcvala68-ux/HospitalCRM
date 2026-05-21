import IPDAdmission from '../models/IPDAdmission.js';
import Bed from '../models/Bed.js';
import Ward from '../models/Ward.js';
import Doctor from '../models/Doctor.js';

export const listWards = async (req, res, next) => {
  try {
    const wards = await Ward.find().sort({ name: 1 });
    res.json({ wards });
  } catch (error) { next(error); }
};

export const getWardBeds = async (req, res, next) => {
  try {
    const beds = await Bed.find({ ward: req.params.wardId })
      .populate('currentPatient', 'firstName lastName uhid')
      .sort({ bedNo: 1 });
    res.json({ beds });
  } catch (error) { next(error); }
};

export const admitPatient = async (req, res, next) => {
  try {
    const { patientId, bedId, diagnosis, admittingDoctorId } = req.body;
    const bed = await Bed.findById(bedId);
    if (!bed || bed.status !== 'available') {
      return res.status(400).json({ message: 'Bed not available' });
    }
    const admission = await IPDAdmission.create({
      patient: patientId,
      bed: bedId,
      ward: bed.ward,
      admittedBy: req.user._id,
      diagnosis,
      admittingDoctor: admittingDoctorId,
      status: 'active',
    });
    bed.status = 'occupied';
    bed.currentPatient = patientId;
    bed.admissionDate = new Date();
    await bed.save();
    const populated = await IPDAdmission.findById(admission._id)
      .populate('patient', 'firstName lastName uhid phone gender')
      .populate('bed', 'bedNo')
      .populate({ path: 'ward', select: 'name type ratePerDay' })
      .populate({ path: 'admittingDoctor', populate: { path: 'user', select: 'name' } });
    res.status(201).json({ admission: populated });
  } catch (error) { next(error); }
};

export const listActive = async (req, res, next) => {
  try {
    const admissions = await IPDAdmission.find({ status: 'active' })
      .populate('patient', 'firstName lastName uhid phone')
      .populate('bed', 'bedNo')
      .populate('ward', 'name type')
      .populate({ path: 'admittingDoctor', populate: { path: 'user', select: 'name' } })
      .sort({ createdAt: -1 });
    res.json({ admissions });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const admission = await IPDAdmission.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone gender bloodGroup')
      .populate('bed', 'bedNo')
      .populate('ward', 'name type ratePerDay')
      .populate({ path: 'admittingDoctor', populate: { path: 'user', select: 'name' } })
      .populate('admittedBy', 'name')
      .populate('vitals.recordedBy', 'name')
      .populate('dailyNotes.addedBy', 'name');
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    res.json({ admission });
  } catch (error) { next(error); }
};

export const addVitals = async (req, res, next) => {
  try {
    const admission = await IPDAdmission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    const { bp, temperature, pulse, spo2, weight, height } = req.body;
    admission.vitals.push({ bp, temperature, pulse, spo2, weight, height, recordedBy: req.user._id });
    await admission.save();
    res.json({ admission });
  } catch (error) { next(error); }
};

export const addNote = async (req, res, next) => {
  try {
    const admission = await IPDAdmission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    const { note, category } = req.body;
    admission.dailyNotes.push({ note, category, addedBy: req.user._id });
    await admission.save();
    res.json({ admission });
  } catch (error) { next(error); }
};

export const discharge = async (req, res, next) => {
  try {
    const { dischargeSummary } = req.body;
    const admission = await IPDAdmission.findById(req.params.id);
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    admission.status = 'discharged';
    admission.dischargeDate = new Date();
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (doctor) admission.dischargingDoctor = doctor._id;
    if (dischargeSummary) admission.dischargeSummary = dischargeSummary;
    await admission.save();
    const bed = await Bed.findById(admission.bed);
    if (bed) {
      bed.status = 'dirty';
      bed.currentPatient = null;
      bed.admissionDate = null;
      await bed.save();
    }
    res.json({ admission });
  } catch (error) { next(error); }
};

export const updateDiet = async (req, res, next) => {
  try {
    const admission = await IPDAdmission.findByIdAndUpdate(
      req.params.id,
      { diet: req.body.diet },
      { new: true }
    );
    if (!admission) return res.status(404).json({ message: 'Admission not found' });
    res.json({ admission });
  } catch (error) { next(error); }
};

export const markBedClean = async (req, res, next) => {
  try {
    const bed = await Bed.findByIdAndUpdate(
      req.params.bedId,
      { status: 'available', lastCleanedAt: new Date() },
      { new: true }
    );
    if (!bed) return res.status(404).json({ message: 'Bed not found' });
    res.json({ bed });
  } catch (error) { next(error); }
};
