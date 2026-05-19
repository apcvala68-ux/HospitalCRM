import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDoctor, useDeleteDoctor } from '../../hooks/useDoctor';
import { ConfirmDelete } from '../../components/ui/ConfirmDelete';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import {
  Phone, Mail, Calendar,
  MapPin, Languages, User,
  ArrowLeft, Pencil, Trash2,
} from 'lucide-react';

export function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useDoctor(id);
  const deleteMut = useDeleteDoctor();
  const doctor = data?.doctor;

  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!doctor) return <div className="py-12 text-center text-muted-foreground">Doctor not found</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/doctors" className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{doctor.user?.name}</h1>
            <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/doctors/${doctor._id}/edit`}><Button variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit</Button></Link>
          <Button variant="destructive" onClick={() => setShowDelete(true)}><Trash2 className="mr-2 h-4 w-4" /> Deactivate</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-sm font-semibold">Professional Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Specialization</span><span className="text-sm font-medium">{doctor.specialization}</span></div>
              <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">License Number</span><span className="text-sm font-mono">{doctor.licenseNo}</span></div>
              <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Department</span><span className="text-sm font-medium">{doctor.department?.name || <span className="text-muted-foreground">—</span>}</span></div>
              <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Consultation Fee</span><span className="text-sm font-semibold">₹{doctor.consultationFee || 0}</span></div>
              <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Years of Experience</span><span className="text-sm font-medium">{doctor.yearsOfExperience ? `${doctor.yearsOfExperience} years` : <span className="text-muted-foreground">—</span>}</span></div>
              <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Status</span><Badge variant={doctor.isAvailable ? 'success' : 'secondary'} className="capitalize">{doctor.isAvailable ? 'Available' : 'Away'}</Badge></div>
            </div>
            <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Qualifications</span><div className="flex flex-wrap gap-1.5">{doctor.qualifications?.length ? doctor.qualifications.map((q, i) => <Badge key={i} variant="outline" className="font-medium text-[11px] bg-muted/20 border-border/10">{q}</Badge>) : <span className="text-sm text-muted-foreground">—</span>}</div></div>
            {doctor.bio && <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Bio</span><p className="text-sm text-muted-foreground">{doctor.bio}</p></div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Personal Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Email</span><div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{doctor.user?.email}</span></div></div>
            <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Phone</span><div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{doctor.user?.phone || <span className="text-muted-foreground">—</span>}</span></div></div>
            {doctor.gender && <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Gender</span><div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm capitalize">{doctor.gender}</span></div></div>}
            {doctor.dateOfBirth && <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Date of Birth</span><div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-sm">{new Date(doctor.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div></div>}
            {doctor.address && <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Address</span><div className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" /><span className="text-sm text-muted-foreground">{doctor.address}</span></div></div>}
            {doctor.languages?.length > 0 && <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Languages</span><div className="flex items-center gap-2 flex-wrap"><Languages className="h-3.5 w-3.5 text-muted-foreground" />{doctor.languages.map((l, i) => <Badge key={i} variant="outline" className="text-[11px] bg-muted/20 border-border/10">{l}</Badge>)}</div></div>}
          </CardContent>
        </Card>
      </div>

      {doctor.emergencyContact?.name && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Emergency Contact</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Name</span><span className="text-sm font-medium">{doctor.emergencyContact.name}</span></div>
            <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Phone</span><span className="text-sm">{doctor.emergencyContact.phone}</span></div>
            <div><span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Relationship</span><span className="text-sm capitalize">{doctor.emergencyContact.relationship}</span></div>
          </CardContent>
        </Card>
      )}

      {doctor.schedule?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Schedule</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => {
                const slot = doctor.schedule.find(s => s.day === day);
                return (
                  <div key={day} className={cn("rounded-xl border p-3", slot?.isAvailable ? "border-border/40" : "border-border/10 bg-muted/20")}>
                    <p className="text-xs font-semibold capitalize mb-1">{day}</p>
                    {slot?.isAvailable ? <p className="text-[11px] text-muted-foreground">{slot.startTime} – {slot.endTime}</p> : <p className="text-[11px] text-muted-foreground">Off</p>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      <ConfirmDelete isOpen={showDelete} onClose={()=>setShowDelete(false)} onConfirm={()=>{deleteMut.mutate(doctor._id, { onSuccess: () => navigate('/doctors') });setShowDelete(false);}} title="Deactivate Doctor" message={`Deactivate doctor "${doctor?.user?.name}"? They will no longer appear in listings.`} confirmLabel="Deactivate" />
    </div>
  );
}
