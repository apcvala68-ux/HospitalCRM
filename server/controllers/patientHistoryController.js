import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';
import LabOrder from '../models/LabOrder.js';
import Billing from '../models/Billing.js';
import Appointment from '../models/Appointment.js';
import IPDAdmission from '../models/IPDAdmission.js';
import QueueToken from '../models/QueueToken.js';
import NursingMAR from '../models/NursingMAR.js';
import InsuranceClaim from '../models/InsuranceClaim.js';
import BloodBank from '../models/BloodBank.js';
import Allergy from '../models/Allergy.js';
import OTSurgery from '../models/OTSurgery.js';
import Feedback from '../models/Feedback.js';

export const fullHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const patient = await Patient.findById(id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const [
      prescriptions,
      labOrders,
      billings,
      appointments,
      ipdAdmissions,
      queueTokens,
      marRecords,
      insuranceClaims,
      bloodRecords,
      allergies,
      surgeries,
      feedbacks,
    ] = await Promise.all([
      Prescription.find({ patient: id }).populate({ path: 'doctor', populate: [{ path: 'user', select: 'name' }, { path: 'department', select: 'name' }] }).sort({ createdAt: -1 }).limit(50),
      LabOrder.find({ patient: id }).populate({ path: 'doctor', populate: [{ path: 'user', select: 'name' }, { path: 'department', select: 'name' }] }).sort({ createdAt: -1 }).limit(50),
      Billing.find({ patient: id }).populate({ path: 'doctor', populate: [{ path: 'user', select: 'name' }, { path: 'department', select: 'name' }] }).sort({ createdAt: -1 }).limit(50),
      Appointment.find({ patient: id }).populate({ path: 'doctor', populate: [{ path: 'user', select: 'name' }, { path: 'department', select: 'name' }] }).sort({ date: -1 }).limit(50),
      IPDAdmission.find({ patient: id }).populate('ward', 'name').populate('bed', 'bedNo').populate({ path: 'admittingDoctor', populate: [{ path: 'user', select: 'name' }, { path: 'department', select: 'name' }] }).populate({ path: 'dischargingDoctor', populate: [{ path: 'user', select: 'name' }, { path: 'department', select: 'name' }] }).sort({ admissionDate: -1 }).limit(50),
      QueueToken.find({ patient: id }).populate({ path: 'doctor', populate: [{ path: 'user', select: 'name' }, { path: 'department', select: 'name' }] }).populate('department', 'name').sort({ createdAt: -1 }).limit(50),
      NursingMAR.find({ patient: id }).sort({ createdAt: -1 }).limit(50),
      InsuranceClaim.find({ patient: id }).sort({ createdAt: -1 }).limit(50),
      BloodBank.find({ patient: id }).sort({ createdAt: -1 }).limit(50),
      Allergy.find({ patient: id, isActive: true }).populate('diagnosedBy', 'user').sort({ createdAt: -1 }),
      OTSurgery.find({ patient: id }).populate('surgeon', 'user').populate('anesthetist', 'user').sort({ scheduledDate: -1 }).limit(50),
      Feedback.find({ patient: id }).sort({ createdAt: -1 }).limit(50),
    ]);

    const totalVisits = queueTokens.length + appointments.length;
    const totalSpent = billings.reduce((sum, b) => sum + (b.total || 0), 0);
    const totalPaid = billings.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
    const totalPending = totalSpent - totalPaid;

    const lastVisit = [...queueTokens, ...appointments]
      .filter(v => v.createdAt || v.date)
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];

    const chronicConditions = patient.medicalHistory?.conditions || [];
    const pastSurgeries = patient.medicalHistory?.surgeries || [];
    const familyHistory = patient.medicalHistory?.familyHistory || [];

    res.json({
      patient,
      summary: {
        totalVisits,
        totalPrescriptions: prescriptions.length,
        totalLabOrders: labOrders.length,
        totalIPDAdmissions: ipdAdmissions.length,
        totalSurgeries: surgeries.length,
        totalSpent,
        totalPaid,
        totalPending,
        lastVisit: lastVisit ? new Date(lastVisit.createdAt || lastVisit.date).toLocaleDateString() : 'Never',
        allergies: allergies.length,
        activeMARs: marRecords.filter(m => m.status === 'active').length,
      },
      prescriptions,
      labOrders,
      billings,
      appointments,
      ipdAdmissions,
      queueTokens,
      marRecords,
      insuranceClaims,
      bloodRecords,
      allergies,
      surgeries,
      feedbacks,
      medicalHistory: {
        chronicConditions,
        pastSurgeries,
        familyHistory,
        habits: patient.medicalHistory?.habits || {},
        immunizations: patient.medicalHistory?.immunizations || [],
      },
    });
  } catch (error) { next(error); }
};
