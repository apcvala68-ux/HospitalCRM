import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Droplets, AlertTriangle, Heart, User as UserIcon, Calendar, Shield } from 'lucide-react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { displayPhone } from '../../../lib/utils';

const GRADIENTS = [
  'linear-gradient(135deg,#6366f1 0%,#a855f7 100%)',
  'linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)',
  'linear-gradient(135deg,#3b82f6 0%,#0ea5e9 100%)',
  'linear-gradient(135deg,#10b981 0%,#059669 100%)',
  'linear-gradient(135deg,#f59e0b 0%,#ef4444 100%)',
];
const getGradient = (s = '') => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h);
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
};

const severityColor = {
  mild: 'bg-green-500',
  moderate: 'bg-yellow-500',
  severe: 'bg-orange-500',
  'life-threatening': 'bg-red-600',
};

export function PatientHeroHeader({ patient, age, allergies, medicalHistory, id, navigate }) {
  const fullName = `${patient.firstName} ${patient.lastName}`;
  const gradient = getGradient(patient._id);
  const initials = `${patient.firstName?.[0] ?? ''}${patient.lastName?.[0] ?? ''}`;
  const chronicConditions = medicalHistory?.chronicConditions ?? [];

  return (
    <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow-lg">
      {/* Top gradient bar */}
      <div className="h-1.5 w-full" style={{ background: gradient }} />

      <div className="p-6 space-y-5">
        {/* Row 1: back + actions */}
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Link to={`/patients/${id}/edit`}>
              <Button variant="outline" size="sm">Edit Patient</Button>
            </Link>
            <Link to={`/queue?patient=${id}`}>
              <Button variant="outline" size="sm">Add to Queue</Button>
            </Link>
            <Link to={`/billing/new?patient=${id}`}>
              <Button size="sm">New Invoice</Button>
            </Link>
          </div>
        </div>

        {/* Row 2: Identity block */}
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div
            className="h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg"
            style={{ background: gradient }}
          >
            {initials}
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground truncate">{fullName}</h1>
              {patient.bloodGroup && (
                <Badge variant="outline" className="flex items-center gap-1 font-bold text-red-500 border-red-400/50 bg-red-500/10">
                  <Droplets className="h-3 w-3" />
                  {patient.bloodGroup}
                </Badge>
              )}
              {patient.gender && (
                <span className="text-sm text-muted-foreground capitalize">
                  {age}y · {patient.gender}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="font-mono text-xs bg-muted/30 px-2 py-0.5 rounded-md">{patient.uhid}</span>
              {patient.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  {displayPhone(patient.phone)}
                </span>
              )}
              {patient.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  {patient.email}
                </span>
              )}
              {patient.address?.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" />
                  {[patient.address.city, patient.address.state].filter(Boolean).join(', ')}
                </span>
              )}
            </div>

            {/* Doctor-critical flags: allergies + chronic conditions inline */}
            <div className="flex flex-wrap gap-2 pt-1">
              {allergies.map(a => (
                <span
                  key={a._id}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-destructive/10 border border-destructive/30 text-destructive"
                >
                  <AlertTriangle className="h-3 w-3" />
                  {a.substance}
                  <span className={`h-1.5 w-1.5 rounded-full ${severityColor[a.severity]}`} />
                </span>
              ))}
              {chronicConditions.map((c, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold bg-amber-500/10 border border-amber-400/30 text-amber-500"
                >
                  <Heart className="h-3 w-3" />
                  {c}
                </span>
              ))}
            </div>
          </div>

          {/* Emergency contact pill */}
          {patient.emergencyContact?.name && (
            <div className="shrink-0 hidden md:flex flex-col items-end gap-1 text-right text-sm">
              <span className="text-xs font-semibold text-destructive flex items-center gap-1">
                <Shield className="h-3 w-3" /> Emergency
              </span>
              <span className="font-medium text-foreground">{patient.emergencyContact.name}</span>
              <span className="text-muted-foreground text-xs">{displayPhone(patient.emergencyContact.phone)}</span>
              {patient.emergencyContact.relation && (
                <span className="text-xs text-muted-foreground capitalize">{patient.emergencyContact.relation}</span>
              )}
            </div>
          )}
        </div>

        {/* Row 3: Registration row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground border-t border-border/30 pt-3">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            Registered {new Date(patient.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          {patient.registeredBy && (
            <span className="flex items-center gap-1.5">
              <UserIcon className="h-3 w-3" />
              By {patient.registeredBy.name}
            </span>
          )}
          {patient.occupation && <span>· {patient.occupation}</span>}
          {patient.maritalStatus && <span className="capitalize">· {patient.maritalStatus}</span>}
        </div>
      </div>
    </div>
  );
}
