import LabTest from '../models/LabTest.js';
import Doctor from '../models/Doctor.js';

export const create = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const labTest = await LabTest.create({
      ...req.body,
      doctor: doctor._id,
      createdBy: req.user._id,
    });

    const populated = await LabTest.findById(labTest._id)
      .populate('patient', 'firstName lastName uhid')
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      });

    res.status(201).json({ labTest: populated });
  } catch (error) {
    next(error);
  }
};

export const createBatch = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });

    const { patientId, tests, prescriptionId } = req.body;
    const labTests = await LabTest.insertMany(
      tests.map((t) => ({
        patient: patientId,
        doctor: doctor._id,
        prescription: prescriptionId,
        testName: t.testName,
        instructions: t.instructions,
        createdBy: req.user._id,
      }))
    );

    res.status(201).json({ labTests });
  } catch (error) {
    next(error);
  }
};

export const getByPatient = async (req, res, next) => {
  try {
    const labTests = await LabTest.find({ patient: req.params.patientId })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' },
      })
      .sort({ orderedAt: -1 });
    res.json({ labTests });
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const updates = { status: req.body.status };
    if (req.body.status === 'sample-collected') updates.collectedAt = new Date();
    if (req.body.status === 'completed') {
      updates.completedAt = new Date();
      updates.result = req.body.result;
    }
    const labTest = await LabTest.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!labTest) return res.status(404).json({ message: 'Lab test not found' });
    res.json({ labTest });
  } catch (error) {
    next(error);
  }
};
