import { Modal } from '@heroui/react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { X } from 'lucide-react';

const statusVariant = {
  scheduled: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'destructive',
  'checked-in': 'info',
  'no-show': 'destructive'
};

export function EventDetailsModal({
  selectedEvent,
  onClose,
  onConfirm,
  onCancel,
  onViewPatient,
  isConfirmPending,
  isCancelPending
}) {
  if (!selectedEvent) return null;

  return (
    <Modal>
      <Modal.Backdrop isOpen={!!selectedEvent} onOpenChange={(open) => { if (!open) onClose(); }} className="backdrop-blur-sm bg-black/40">
        <Modal.Container>
          <Modal.Dialog className="bg-card border border-border/50 rounded-2xl shadow-2xl max-w-sm w-full relative">
            <Modal.CloseTrigger className="absolute right-4 top-4 opacity-75 hover:opacity-100 transition-opacity cursor-pointer text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
            </Modal.CloseTrigger>
            <Modal.Header className="border-b border-border/20 py-4 px-5">
              <Modal.Heading className="font-bold text-foreground">Appointment Details</Modal.Heading>
            </Modal.Header>
            <Modal.Body className="py-5 px-5 space-y-3.5 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-border/10">
                <span className="text-muted-foreground font-medium">Patient:</span>
                <span className="font-semibold text-foreground">
                  {selectedEvent.patient?.firstName} {selectedEvent.patient?.lastName}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/10">
                <span className="text-muted-foreground font-medium">Doctor:</span>
                <span className="font-semibold text-foreground">
                  {selectedEvent.doctor?.user?.name}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/10">
                <span className="text-muted-foreground font-medium">Status:</span>
                <Badge variant={statusVariant[selectedEvent.status] || 'default'} className="capitalize">
                  {selectedEvent.status === 'no-show' ? 'Missed' : selectedEvent.status}
                </Badge>
              </div>
            </Modal.Body>
            <Modal.Footer className="border-t border-border/20 py-3.5 px-5 flex flex-col gap-2 w-full">
              <div className="flex gap-2 w-full">
                {selectedEvent.status === 'scheduled' && (
                  <Button 
                    size="sm" 
                    onClick={onConfirm} 
                    disabled={isConfirmPending} 
                    className="flex-1 rounded-xl"
                  >
                    Accept
                  </Button>
                )}
                {selectedEvent.status !== 'cancelled' && selectedEvent.status !== 'completed' && selectedEvent.status !== 'no-show' && (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={onCancel} 
                    disabled={isCancelPending} 
                    className="flex-1 rounded-xl"
                  >
                    Cancel
                  </Button>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onViewPatient} 
                className="w-full rounded-xl"
              >
                View Patient Profile
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
