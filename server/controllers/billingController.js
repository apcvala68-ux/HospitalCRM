import Billing from '../models/Billing.js';

const generateInvoiceNo = async () => {
  const now = new Date();
  const prefix = `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-`;
  const last = await Billing.findOne({ invoiceNo: new RegExp(`^${prefix}`) })
    .sort({ invoiceNo: -1 })
    .select('invoiceNo');
  let next = 1;
  if (last) {
    next = parseInt(last.invoiceNo.split('-')[2], 10) + 1;
  }
  return `${prefix}${String(next).padStart(5, '0')}`;
};

export const list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { invoiceNo: new RegExp(search, 'i') },
      ];
    }
    const total = await Billing.countDocuments(query);
    const bills = await Billing.find(query)
      .populate('patient', 'firstName lastName uhid phone')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ bills, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id)
      .populate('patient', 'firstName lastName uhid phone address')
      .populate('createdBy', 'name');
    if (!bill) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ bill });
  } catch (error) {
    next(error);
  }
};

export const getByPatient = async (req, res, next) => {
  try {
    const bills = await Billing.find({ patient: req.params.patientId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ bills });
  } catch (error) {
    next(error);
  }
};

export const create = async (req, res, next) => {
  try {
    const { items, discount = 0, tax = 0, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'At least one item required' });
    }

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const total = subtotal + tax - discount;

    const invoiceNo = await generateInvoiceNo();

    const bill = await Billing.create({
      patient: req.body.patient,
      appointment: req.body.appointment,
      invoiceNo,
      items: items.map((item) => ({
        ...item,
        amount: item.quantity * item.rate,
      })),
      subtotal,
      tax,
      discount,
      total,
      notes,
      createdBy: req.user._id,
    });

    const populated = await Billing.findById(bill._id)
      .populate('patient', 'firstName lastName uhid')
      .populate('createdBy', 'name');

    res.status(201).json({ bill: populated });
  } catch (error) {
    next(error);
  }
};

export const addPayment = async (req, res, next) => {
  try {
    const bill = await Billing.findById(req.params.id);
    if (!bill) return res.status(404).json({ message: 'Invoice not found' });
    if (bill.status === 'paid' || bill.status === 'cancelled') {
      return res.status(400).json({ message: `Invoice is already ${bill.status}` });
    }

    const { method, amount, reference } = req.body;
    const totalPaid = bill.amountPaid + amount;

    bill.paymentSplits.push({ method, amount, reference });
    bill.amountPaid = totalPaid;

    if (totalPaid >= bill.total) {
      bill.status = 'paid';
      bill.paidAt = new Date();
      bill.paymentMethod = method;
    } else if (totalPaid > 0) {
      bill.status = 'partial';
    }

    await bill.save();

    const populated = await Billing.findById(bill._id)
      .populate('patient', 'firstName lastName uhid')
      .populate('createdBy', 'name');

    res.json({ bill: populated });
  } catch (error) {
    next(error);
  }
};

export const cancelInvoice = async (req, res, next) => {
  try {
    const bill = await Billing.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled', notes: req.body.reason },
      { new: true }
    );
    if (!bill) return res.status(404).json({ message: 'Invoice not found' });
    res.json({ bill });
  } catch (error) {
    next(error);
  }
};

export const eodReport = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const bills = await Billing.find({
      createdAt: { $gte: targetDate, $lt: nextDay },
    }).populate('patient', 'firstName lastName uhid');

    const totalBills = bills.length;
    const totalRevenue = bills.reduce((sum, b) => sum + b.amountPaid, 0);
    const totalBilled = bills.reduce((sum, b) => sum + b.total, 0);
    const pending = bills.filter((b) => b.status === 'pending' || b.status === 'partial');
    const paid = bills.filter((b) => b.status === 'paid');

    const byMethod = {};
    bills.forEach((b) => {
      b.paymentSplits.forEach((p) => {
        byMethod[p.method] = (byMethod[p.method] || 0) + p.amount;
      });
    });

    res.json({
      date: targetDate,
      summary: {
        totalBills,
        totalBilled: Math.round(totalBilled),
        totalRevenue: Math.round(totalRevenue),
        pendingBills: pending.length,
        paidBills: paid.length,
        pendingAmount: Math.round(pending.reduce((s, b) => s + (b.total - b.amountPaid), 0)),
      },
      paymentMethods: byMethod,
      bills,
    });
  } catch (error) {
    next(error);
  }
};
