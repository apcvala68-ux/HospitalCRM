import Prescription from '../models/Prescription.js';
import Doctor from '../models/Doctor.js';

export const create = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const prescription = await Prescription.create({
      ...req.body,
      doctor: doctor._id,
      createdBy: req.user._id,
    });

    const populated = await Prescription.findById(prescription._id)
      .populate('patient', 'firstName lastName uhid')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      });

    res.status(201).json({ prescription: populated });
  } catch (error) {
    next(error);
  }
};

export const getByPatient = async (req, res, next) => {
  try {
    const prescriptions = await Prescription.find({ patient: req.params.patientId })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      })
      .sort({ createdAt: -1 });
    res.json({ prescriptions });
  } catch (error) {
    next(error);
  }
};

export const getMyPatientPrescriptions = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const prescriptions = await Prescription.find({
      patient: req.params.patientId,
      doctor: doctor._id,
    })
      .populate('patient', 'firstName lastName uhid')
      .sort({ createdAt: -1 });
    res.json({ prescriptions });
  } catch (error) {
    next(error);
  }
};
