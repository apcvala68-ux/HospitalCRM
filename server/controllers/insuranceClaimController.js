import InsuranceClaim from '../models/InsuranceClaim.js';

const SORTABLE_FIELDS = ['createdAt', 'claimNo', 'status', 'claimAmount', 'approvedAmount', 'tpaName'];

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy, sortOrder, status, tpaName, patient } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { claimNo: new RegExp(search, 'i') },
        { tpaName: new RegExp(search, 'i') },
      ];
    }
    if (status) query.status = status;
    if (tpaName) query.tpaName = new RegExp(tpaName, 'i');
    if (patient) query.patient = patient;
    const sortField = SORTABLE_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const claims = await InsuranceClaim.find(query)
      .populate('patient', 'firstName lastName uhid phone')
      .populate('billing', 'invoiceNo total')
      .sort({ [sortField]: sortDir })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    const total = await InsuranceClaim.countDocuments(query);
    res.json({ claims, total, page: +page, pages: Math.ceil(total / limit), totalPages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
};

export const getById = async (req, res, next) => {
  try {
    const claim = await InsuranceClaim.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone age gender')
      .populate('billing', 'invoiceNo total items payments');
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json({ claim });
  } catch (error) { next(error); }
};

export const create = async (req, res, next) => {
  try {
    const claim = await InsuranceClaim.create(req.body);
    res.status(201).json({ claim });
  } catch (error) { next(error); }
};

export const update = async (req, res, next) => {
  try {
    const claim = await InsuranceClaim.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!claim) return res.status(404).json({ message: 'Claim not found' });
    res.json({ claim });
  } catch (error) { next(error); }
};

export const approve = async (req, res, next) => {
  try {
    const { approvedAmount, rejectedAmount, deductionAmount, remarks } = req.body;
    const claim = await InsuranceClaim.findByIdAndUpdate(req.params.id, {
      approvedAmount,
      rejectedAmount,
      deductionAmount,
      remarks,
      status: 'approved',
      approvalDate: new Date(),
    }, { new: true });
    res.json({ claim });
  } catch (error) { next(error); }
};

export const reject = async (req, res, next) => {
  try {
    const { rejectionReason } = req.body;
    const claim = await InsuranceClaim.findByIdAndUpdate(req.params.id, {
      rejectionReason,
      status: 'rejected',
    }, { new: true });
    res.json({ claim });
  } catch (error) { next(error); }
};

export const stats = async (req, res, next) => {
  try {
    const total = await InsuranceClaim.countDocuments();
    const pending = await InsuranceClaim.countDocuments({ status: { $in: ['pre-auth', 'submitted', 'under-review'] } });
    const approved = await InsuranceClaim.countDocuments({ status: 'approved' });
    const rejected = await InsuranceClaim.countDocuments({ status: 'rejected' });
    const totalClaimed = await InsuranceClaim.aggregate([
      { $group: { _id: null, total: { $sum: '$claimAmount' } } },
    ]);
    const totalApproved = await InsuranceClaim.aggregate([
      { $match: { status: { $in: ['approved', 'settled'] } } },
      { $group: { _id: null, total: { $sum: '$approvedAmount' } } },
    ]);
    res.json({
      total, pending, approved, rejected,
      totalClaimed: totalClaimed[0]?.total || 0,
      totalApproved: totalApproved[0]?.total || 0,
    });
  } catch (error) { next(error); }
};
