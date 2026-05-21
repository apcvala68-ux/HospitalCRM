import { Modal } from '@heroui/react';
import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

const GRADIENTS = [
  'linear-gradient(135deg, #a78bfa 0%, #ec4899 100%)',
  'linear-gradient(135deg, #f472b6 0%, #f43f5e 100%)',
  'linear-gradient(135deg, #38bdf8 0%, #3b82f6 100%)',
  'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
  'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
  'linear-gradient(135deg, #a78bfa 0%, #6366f1 100%)',
  'linear-gradient(135deg, #f472b6 0%, #a855f7 100%)',
  'linear-gradient(135deg, #34d399 0%, #059669 100%)'
];

const getGradient = (id) => {
  if (!id) return GRADIENTS[0];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
};

function NativeSelect({ value, onChange, placeholder, children, className }) {
  return (
    <select
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      className={`flex h-10 w-full rounded-xl border border-border/50 bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer ${className || ''}`}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {children}
    </select>
  );
}

export function BookingModal({
  isOpen,
  onClose,
  doctors,
  selectedDoctor,
  setSelectedDoctor,
  selectedDate,
  setSelectedDate,
  selectedSlot,
  setSelectedSlot,
  patientSearch,
  setPatientSearch,
  selectedPatient,
  setSelectedPatient,
  reason,
  setReason,
  searchResults,
  slotAvailability,
  timeSlots,
  maxSlots,
  handleBook,
  isPending
}) {
  const [doctorSearch, setDoctorSearch] = useState('');
  const [doctorDropdownOpen, setDoctorDropdownOpen] = useState(false);
  const filteredDoctors = doctors.filter(d =>
    !doctorSearch || d.user?.name?.toLowerCase().includes(doctorSearch.toLowerCase())
  );
  const selectedDoctorObj = doctors.find(d => d._id === selectedDoctor);

  const handleSelectDoctor = (id) => {
    setSelectedDoctor(id);
    setDoctorSearch('');
    setDoctorDropdownOpen(false);
  };
  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }} className="backdrop-blur-sm bg-black/40">
        <Modal.Container>
          <Modal.Dialog className="bg-card border border-border/40 rounded-2xl shadow-elevated max-w-2xl w-full">
            <Modal.CloseTrigger className="absolute right-4 top-4 opacity-60 hover:opacity-100 transition-all cursor-pointer text-foreground/50 hover:text-foreground z-10">
              <X className="h-4 w-4" />
            </Modal.CloseTrigger>
            <Modal.Header className="border-b border-border/20 py-5 px-6 flex flex-col gap-0.5">
              <Modal.Heading className="text-xl font-bold text-foreground">Book Appointment</Modal.Heading>
              <p className="text-xs text-foreground/60">Select patient, doctor, and appropriate time slot.</p>
            </Modal.Header>
            <Modal.Body className="py-6 px-6 grid gap-5 md:grid-cols-2">
              {/* Patient Selection */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider block">Patient</label>
                {selectedPatient ? (
                  <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-3 transition-all">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md shrink-0"
                        style={{ background: getGradient(selectedPatient._id) }}
                      >
                        {selectedPatient.firstName?.charAt(0)}{selectedPatient.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono">{selectedPatient.uhid}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedPatient(null); setPatientSearch(''); }}
                      className="h-8 px-2 border-border/50 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search patient by name or ID..."
                        value={patientSearch}
                        onChange={e => setPatientSearch(e.target.value)}
                        className="pl-10 h-10 rounded-xl bg-background"
                      />
                    </div>
                    {searchResults?.patients?.length > 0 && (
                      <div className="absolute z-50 w-full mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-border/60 bg-card shadow-elevated animate-in fade-in duration-100">
                        {searchResults.patients.map(p => (
                          <button
                            key={p._id}
                            type="button"
                            onClick={() => { setSelectedPatient(p); setPatientSearch(''); }}
                            className="w-full px-4 py-3 text-left hover:bg-muted/40 border-b last:border-0 border-border/20 flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <div
                               className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm shrink-0"
                               style={{ background: getGradient(p._id) }}
                            >
                              {p.firstName?.charAt(0)}{p.lastName?.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{p.firstName} {p.lastName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{p.uhid}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Doctor Selector with Search */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider block">Doctor</label>
                {selectedDoctorObj ? (
                  <div className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 p-3 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary text-white font-bold text-sm shrink-0">
                        {selectedDoctorObj.user?.name?.charAt(0) || 'D'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{selectedDoctorObj.user?.name}</p>
                        <p className="text-[11px] text-muted-foreground">{selectedDoctorObj.specialization}{selectedDoctorObj.maxPatientsPerHour ? ` (${selectedDoctorObj.maxPatientsPerHour}/hr)` : ''}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { setSelectedDoctor(''); setDoctorSearch(''); }}
                      className="h-8 px-2 border-border/50 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search doctors..."
                        value={doctorSearch}
                        onChange={e => setDoctorSearch(e.target.value)}
                        onFocus={() => setDoctorDropdownOpen(true)}
                        onBlur={() => setTimeout(() => setDoctorDropdownOpen(false), 200)}
                        className="pl-10 h-10 rounded-xl bg-background"
                      />
                    </div>
                    {doctorDropdownOpen && filteredDoctors.length > 0 && (
                      <div className="absolute z-50 w-full mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-border/60 bg-card shadow-elevated animate-in fade-in duration-100">
                        {filteredDoctors.map(d => (
                          <button
                            key={d._id}
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); handleSelectDoctor(d._id); }}
                            className="w-full px-4 py-3 text-left hover:bg-muted/40 border-b last:border-0 border-border/20 flex items-center gap-3 transition-colors cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/20 text-primary font-bold text-xs shrink-0">
                              {d.user?.name?.charAt(0) || 'D'}
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-foreground">{d.user?.name}</p>
                              <p className="text-[10px] text-muted-foreground">{d.specialization}{d.maxPatientsPerHour ? ` (${d.maxPatientsPerHour}/hr)` : ''}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Booking Date */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider block">Date</label>
                <div className="relative">
                  <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-border/50 bg-background pl-9 pr-3 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Time Slot */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider block">Time Slot</label>
                <div className="relative">
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  <NativeSelect value={selectedSlot} onChange={setSelectedSlot} placeholder="Select slot">
                    {timeSlots.filter(t => !slotAvailability[t]?.full).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </NativeSelect>
                </div>
                {selectedDoctor && maxSlots > 0 && (
                  <p className="text-[10px] text-muted-foreground">Max {maxSlots} patients per hour</p>
                )}
              </div>

              {/* Reason */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold text-foreground/70 uppercase tracking-wider block">Reason</label>
                <Input
                  placeholder="Reason for visit..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  className="h-10 rounded-xl bg-background"
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="border-t border-border/20 py-4 px-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="rounded-xl h-10 px-5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBook}
                disabled={isPending}
                className="rounded-xl h-10 px-6 bg-primary hover:bg-primary/90 text-white shadow-sm"
              >
                {isPending ? 'Booking...' : 'Book Appointment'}
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
