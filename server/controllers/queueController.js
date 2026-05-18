import QueueToken from '../models/QueueToken.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Billing from '../models/Billing.js';
import MedicineMaster from '../models/MedicineMaster.js';

export const generateToken = async (req, res, next) => {
  try {
    const { patientId, doctorId, departmentId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastToken = await QueueToken.findOne({
      doctor: doctorId,
      date: { $gte: today },
    }).sort({ tokenNo: -1 });

    const tokenNo = lastToken ? lastToken.tokenNo + 1 : 1;

    const token = await QueueToken.create({
      patient: patientId,
      doctor: doctorId,
      department: departmentId,
      tokenNo,
      date: new Date(),
      status: 'waiting',
      createdBy: req.user._id,
    });

    const populated = await QueueToken.findById(token._id)
      .populate('patient', 'firstName lastName uhid phone')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      });

    res.status(201).json({ token: populated });
  } catch (error) {
    next(error);
  }
};

export const getCurrentQueue = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tokens = await QueueToken.find({
      doctor: doctorId,
      date: { $gte: today },
      status: { $in: ['waiting', 'triage', 'ready', 'called', 'with-doctor'] },
    })
      .populate('patient', 'firstName lastName uhid phone bloodGroup gender')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      })
      .sort({ tokenNo: 1 });

    const waiting = tokens.filter(t => t.status === 'waiting');
    const inTriage = tokens.filter(t => t.status === 'triage');
    const ready = tokens.filter(t => t.status === 'ready');
    const called = tokens.filter(t => t.status === 'called');
    const withDoctor = tokens.filter(t => t.status === 'with-doctor');

    const historyCount = await QueueToken.countDocuments({
      doctor: doctorId,
      date: { $gte: today },
      status: { $in: ['completed', 'no-show', 'cancelled'] },
    });

    res.json({ waiting, inTriage, ready, called, withDoctor, current: withDoctor[0] || null, historyCount });
  } catch (error) {
    next(error);
  }
};

export const getNextPatient = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextToken = await QueueToken.findOne({
      doctor: doctorId,
      date: { $gte: today },
      status: { $in: ['ready', 'waiting', 'triage'] },
    })
      .populate('patient', 'firstName lastName uhid phone bloodGroup gender')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      })
      .sort({ tokenNo: 1 });

    res.json({ nextPatient: nextToken });
  } catch (error) {
    next(error);
  }
};

export const getTodayHistory = async (req, res, next) => {
  try {
    const { doctorId } = req.params;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tokens = await QueueToken.find({
      doctor: doctorId,
      date: { $gte: today },
      status: { $in: ['completed', 'no-show', 'cancelled'] },
    })
      .populate('patient', 'firstName lastName uhid')
      .sort({ tokenNo: 1 });

    res.json({ tokens });
  } catch (error) {
    next(error);
  }
};

export const callPatient = async (req, res, next) => {
  try {
    const token = await QueueToken.findByIdAndUpdate(
      req.params.id,
      { status: 'with-doctor', calledAt: new Date() },
      { new: true }
    );
    if (!token) return res.status(404).json({ message: 'Token not found' });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

export const startConsultation = async (req, res, next) => {
  try {
    const token = await QueueToken.findByIdAndUpdate(
      req.params.id,
      { status: 'with-doctor', calledAt: new Date() },
      { new: true }
    ).populate('patient', 'firstName lastName uhid phone bloodGroup gender');
    if (!token) return res.status(404).json({ message: 'Token not found' });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};

export const completePatient = async (req, res, next) => {
  try {
    const { prescriptionData } = req.body;
    const token = await QueueToken.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date() },
      { new: true }
    ).populate('patient', 'firstName lastName uhid').populate('doctor');

    if (!token) return res.status(404).json({ message: 'Token not found' });

    if (prescriptionData) {
      const doctor = await Doctor.findById(token.doctor._id);
      if (doctor) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const existingDraft = await Billing.findOne({
          patient: token.patient._id,
          doctor: token.doctor._id,
          status: 'pending',
          createdAt: { $gte: today, $lt: tomorrow },
        });

        if (!existingDraft) {
          const items = [{
            description: `Consultation - ${doctor.user ? 'Dr. ' + doctor.user.name : 'Doctor'}`,
            quantity: 1,
            rate: doctor.consultationFee || 0,
            amount: doctor.consultationFee || 0,
          }];

          if (prescriptionData.labTests && prescriptionData.labTests.length > 0) {
            for (const lab of prescriptionData.labTests) {
              const medicine = await MedicineMaster.findOne({ name: new RegExp(lab.testName, 'i') });
              items.push({
                description: `Lab Test - ${lab.testName}`,
                quantity: 1,
                rate: medicine?.mrp || lab.price || 0,
                amount: medicine?.mrp || lab.price || 0,
              });
            }
          }

          const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
          const tax = Math.round(subtotal * 0.05);
          const total = subtotal + tax;

          await Billing.create({
            patient: token.patient._id,
            doctor: token.doctor._id,
            items,
            subtotal,
            tax,
            total,
            amountPaid: 0,
            status: 'pending',
            payments: [],
          });
        }
      }
    }

    const nextToken = await QueueToken.findOne({
      doctor: token.doctor._id,
      date: { $gte: today },
      status: { $in: ['ready', 'waiting', 'triage'] },
    })
      .populate('patient', 'firstName lastName uhid')
      .sort({ tokenNo: 1 });

    res.json({ token, nextPatient: nextToken });
  } catch (error) {
    next(error);
  }
};

export const markNoShow = async (req, res, next) => {
  try {
    const token = await QueueToken.findByIdAndUpdate(
      req.params.id,
      { status: 'no-show' },
      { new: true }
    );
    if (!token) return res.status(404).json({ message: 'Token not found' });
    res.json({ token });
  } catch (error) {
    next(error);
  }
};
