import { Link } from 'react-router-dom';
import { Stethoscope, FlaskConical, Calendar, Pill, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { useState } from 'react';

const statusVariant = {
  pending: 'warning', completed: 'success', cancelled: 'destructive',
  scheduled: 'warning', confirmed: 'info', 'checked-in': 'info',
  paid: 'success', partial: 'warning', unpaid: 'destructive',
  active: 'success', 'no-show': 'destructive',
};

const statusLabel = {
  'no-show': 'Missed',
  'checked-in': 'In Clinic',
};

export function PatientTabPrescriptions({ prescriptions }) {
  const [expanded, setExpanded] = useState(null);

  if (!prescriptions.length) {
    return (
      <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
        <Stethoscope className="h-8 w-8 opacity-30" />
        <p className="text-sm">No prescriptions on record</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {prescriptions.map(rx => (
        <div key={rx._id} className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <button
            className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/20 transition-colors"
            onClick={() => setExpanded(expanded === rx._id ? null : rx._id)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Stethoscope className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{rx.prescriptionNo}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {rx.doctor?.user?.name ?? 'Unknown Doctor'} · {new Date(rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {rx.diagnoses?.slice(0, 2).map((d, i) => (
                <Badge key={i} variant="outline" className="text-[10px] hidden sm:flex">{d}</Badge>
              ))}
              {rx.medicines?.length > 0 && (
                <span className="text-xs text-muted-foreground font-medium">{rx.medicines.length} med{rx.medicines.length !== 1 ? 's' : ''}</span>
              )}
              {expanded === rx._id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </button>

          {expanded === rx._id && (
            <div className="border-t border-border/30 p-4 bg-muted/5 space-y-4">
              {rx.diagnoses?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Diagnoses</p>
                  <div className="flex flex-wrap gap-1.5">
                    {rx.diagnoses.map((d, i) => <Badge key={i} variant="outline">{d}</Badge>)}
                  </div>
                </div>
              )}
              {rx.medicines?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Medicines</p>
                  <div className="space-y-2">
                    {rx.medicines.map((m, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-muted/20 px-3 py-2 text-sm">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Pill className="h-3 w-3 text-primary" />{m.name}
                        </span>
                        <span className="text-muted-foreground">{m.dosage}</span>
                        <span className="text-muted-foreground">{m.frequency}</span>
                        <span className="text-muted-foreground">{m.duration}</span>
                        {m.route && <span className="text-muted-foreground capitalize">{m.route}</span>}
                        {m.instructions && <span className="text-muted-foreground italic">{m.instructions}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {rx.labTests?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Lab Tests Advised</p>
                  <div className="flex flex-wrap gap-1.5">
                    {rx.labTests.map((t, i) => <Badge key={i} variant="secondary"><FlaskConical className="h-3 w-3 mr-1" />{t.testName}</Badge>)}
                  </div>
                </div>
              )}
              {rx.notes && <p className="text-sm text-muted-foreground italic border-l-2 border-border pl-3">{rx.notes}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function PatientTabLabOrders({ labOrders }) {
  const [expanded, setExpanded] = useState(null);

  if (!labOrders.length) {
    return (
      <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
        <FlaskConical className="h-8 w-8 opacity-30" />
        <p className="text-sm">No lab orders on record</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {labOrders.map(lo => (
        <div key={lo._id} className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <button
            className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-muted/20 transition-colors"
            onClick={() => setExpanded(expanded === lo._id ? null : lo._id)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <FlaskConical className="h-4 w-4 text-purple-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">{lo.orderNo}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {lo.doctor?.user?.name ?? 'Unknown Doctor'} · {new Date(lo.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={statusVariant[lo.status]}>{lo.status}</Badge>
              {lo.tests?.length > 0 && <span className="text-xs text-muted-foreground">{lo.tests.length} test{lo.tests.length !== 1 ? 's' : ''}</span>}
              {expanded === lo._id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </button>

          {expanded === lo._id && (
            <div className="border-t border-border/30 bg-muted/5">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 text-left text-muted-foreground text-xs">
                      <th className="py-2 px-4 font-semibold">Test</th>
                      <th className="py-2 px-4 font-semibold">Category</th>
                      <th className="py-2 px-4 font-semibold">Priority</th>
                      <th className="py-2 px-4 font-semibold">Result</th>
                      <th className="py-2 px-4 font-semibold">Value</th>
                      <th className="py-2 px-4 font-semibold">Normal Range</th>
                      <th className="py-2 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lo.tests?.map((t, i) => (
                      <tr key={i} className="border-b border-border/20 last:border-0">
                        <td className="py-2 px-4 font-medium">{t.testName}</td>
                        <td className="py-2 px-4 capitalize text-muted-foreground">{t.category}</td>
                        <td className="py-2 px-4">
                          <Badge variant={t.priority === 'stat' ? 'destructive' : t.priority === 'urgent' ? 'warning' : 'secondary'} className="text-[10px]">{t.priority}</Badge>
                        </td>
                        <td className="py-2 px-4">{t.result || '--'}</td>
                        <td className="py-2 px-4 font-medium">{t.resultValue ? `${t.resultValue} ${t.unit ?? ''}` : '--'}</td>
                        <td className="py-2 px-4 text-muted-foreground">{t.normalRange || '--'}</td>
                        <td className="py-2 px-4"><Badge variant={statusVariant[t.status]} className="text-[10px]">{t.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {lo.notes && <p className="p-4 text-sm text-muted-foreground italic border-t border-border/20">{lo.notes}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function PatientTabAppointments({ appointments }) {
  if (!appointments.length) {
    return (
      <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
        <Calendar className="h-8 w-8 opacity-30" />
        <p className="text-sm">No appointments on record</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {appointments.map(a => {
        const dateStr = new Date(a.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        const label = statusLabel[a.status] ?? a.status;
        return (
          <div key={a._id} className="flex items-center gap-4 rounded-xl border border-border/40 bg-card px-4 py-3 hover:border-border/80 transition-colors">
            <div className="text-center min-w-[52px]">
              <p className="text-xs text-muted-foreground">{dateStr.split(' ')[0]}</p>
              <p className="text-sm font-bold">{dateStr.split(' ').slice(1, 3).join(' ')}</p>
            </div>
            <div className="w-px h-8 bg-border/50" />
            <div className="text-xs font-mono text-muted-foreground min-w-[90px]">{a.timeSlot?.start} – {a.timeSlot?.end}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{a.doctor?.user?.name ?? 'Doctor'}</p>
              <p className="text-xs text-muted-foreground truncate">{a.reason || 'No reason provided'}</p>
            </div>
            <Badge variant={statusVariant[a.status]}>{label}</Badge>
          </div>
        );
      })}
    </div>
  );
}

export function PatientTabBilling({ billings }) {
  if (!billings.length) {
    return (
      <div className="flex flex-col items-center py-12 gap-2 text-muted-foreground">
        <p className="text-sm">No billing records</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/40 overflow-hidden bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30 text-left text-xs text-muted-foreground bg-muted/20">
              <th className="py-2.5 px-4 font-semibold">Invoice</th>
              <th className="py-2.5 px-4 font-semibold">Date</th>
              <th className="py-2.5 px-4 font-semibold">Doctor</th>
              <th className="py-2.5 px-4 font-semibold">Total</th>
              <th className="py-2.5 px-4 font-semibold text-green-600">Paid</th>
              <th className="py-2.5 px-4 font-semibold text-rose-500">Pending</th>
              <th className="py-2.5 px-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {billings.map(b => (
              <tr key={b._id} className="border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors">
                <td className="py-2.5 px-4">
                  <Link to={`/billing/${b._id}`} className="font-mono text-xs text-primary hover:underline">{b.invoiceNo}</Link>
                </td>
                <td className="py-2.5 px-4 text-muted-foreground">{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                <td className="py-2.5 px-4">{b.doctor?.user?.name ?? '--'}</td>
                <td className="py-2.5 px-4 font-semibold">₹{(b.total ?? 0).toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-4 text-green-600 font-medium">₹{(b.amountPaid ?? 0).toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-4 text-rose-500 font-medium">₹{((b.total ?? 0) - (b.amountPaid ?? 0)).toLocaleString('en-IN')}</td>
                <td className="py-2.5 px-4"><Badge variant={statusVariant[b.status]} className="text-[10px]">{b.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
