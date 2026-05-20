import { Modal, Select, ListBox, DatePicker, PopoverContent } from '@heroui/react';
import { parseDate } from '@internationalized/date';
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
  let dateValue = null;
  if (selectedDate) {
    try {
      dateValue = parseDate(selectedDate);
    } catch (e) {
      console.error("Error parsing selectedDate:", e);
    }
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={(open) => { if (!open) onClose(); }} className="backdrop-blur-sm bg-black/40">
        <Modal.Container>
          <Modal.Dialog className="bg-card border border-border/50 rounded-2xl shadow-2xl max-w-2xl w-full relative">
            <Modal.CloseTrigger className="absolute right-4 top-4 opacity-75 hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Modal.CloseTrigger>
            <Modal.Header className="border-b border-border/20 py-4 px-6 flex flex-col gap-0.5">
              <Modal.Heading className="text-lg font-bold text-foreground">Book Appointment</Modal.Heading>
              <p className="text-xs text-muted-foreground">Select patient, doctor, and appropriate time slot.</p>
            </Modal.Header>
            <Modal.Body className="py-6 px-6 grid gap-4 md:grid-cols-2">
              {/* Patient Selection Column */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Patient</label>
                {selectedPatient ? (
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/10 p-3 transition-all">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md" 
                        style={{ background: getGradient(selectedPatient._id) }}
                      >
                        {selectedPatient.firstName?.charAt(0)}{selectedPatient.lastName?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</p>
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
                        className="pl-10 h-10 rounded-xl" 
                      />
                    </div>
                    {searchResults?.patients?.length > 0 && (
                      <div className="absolute z-50 w-full mt-1.5 max-h-48 overflow-y-auto rounded-xl border border-border/60 bg-card shadow-xl animate-in fade-in duration-100">
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

              {/* Doctor Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Doctor</label>
                <Select
                  className="w-full"
                  placeholder="Select doctor"
                  selectedKey={selectedDoctor}
                  onSelectionChange={k => setSelectedDoctor(String(k))}
                >
                  <Select.Trigger className="h-10 rounded-xl bg-background border-border/50 text-xs">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="border border-border/60 shadow-lg">
                    <PopoverContent>
                      <ListBox>
                        {doctors.map(d => (
                          <ListBox.Item key={d._id} id={d._id} textValue={d.user?.name}>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">{d.user?.name}</span>
                              <span className="text-[10px] text-muted-foreground">{d.specialization} {d.maxPatientsPerHour ? `(${d.maxPatientsPerHour}/hr)` : ''}</span>
                            </div>
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                      </ListBox>
                    </PopoverContent>
                  </Select.Popover>
                </Select>
              </div>

              {/* Booking Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Date</label>
                <DatePicker
                  aria-label="Date of appointment"
                  value={dateValue}
                  onChange={(date) => {
                    if (date) {
                      setSelectedDate(date.toString());
                    } else {
                      setSelectedDate('');
                    }
                  }}
                  variant="bordered"
                  className="w-full"
                  classNames={{
                    inputWrapper: "h-10 bg-background border-border/50 hover:border-accent focus-within:border-primary shadow-none rounded-xl",
                  }}
                />
              </div>

              {/* Time Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Time Slot</label>
                <Select
                  className="w-full"
                  placeholder="Select slot"
                  selectedKey={selectedSlot}
                  onSelectionChange={k => setSelectedSlot(String(k))}
                >
                  <Select.Trigger className="h-10 rounded-xl bg-background border-border/50 text-xs">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover className="border border-border/60 shadow-lg">
                    <PopoverContent>
                      <ListBox>
                        {timeSlots.map(t => {
                          const info = slotAvailability[t];
                          const isFull = info?.full;
                          const label = isFull ? `${t} (${info.booked}/${info.max} full)` : t;
                          return (
                            <ListBox.Item key={t} id={t} textValue={label} isDisabled={isFull}>
                              <span className={isFull ? 'text-muted-foreground/50' : 'font-medium'}>{label}</span>
                              <ListBox.ItemIndicator />
                            </ListBox.Item>
                          );
                        })}
                      </ListBox>
                    </PopoverContent>
                  </Select.Popover>
                </Select>
                {selectedDoctor && maxSlots > 0 && (
                  <p className="text-[10px] text-muted-foreground">Max {maxSlots} patients per hour</p>
                )}
              </div>

              {/* Reason for Appointment */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Reason</label>
                <Input 
                  placeholder="Reason for visit..." 
                  value={reason} 
                  onChange={e => setReason(e.target.value)} 
                  className="h-10 rounded-xl" 
                />
              </div>
            </Modal.Body>
            <Modal.Footer className="border-t border-border/20 py-4 px-6 flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBook} 
                disabled={isPending} 
                className="rounded-xl px-5"
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
