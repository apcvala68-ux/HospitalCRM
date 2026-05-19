import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDoctor, useCreateDoctor, useUpdateDoctor } from '../../hooks/useDoctor';
import { useDepartments } from '../../hooks/useDepartments';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';
import { ArrowLeft, Save, X } from 'lucide-react';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const LANG_OPTIONS = ['English','Hindi','Marathi','Gujarati','Bengali','Tamil','Telugu','Kannada','Malayalam','Punjabi','Urdu'];

export function DoctorFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: existingData } = useDoctor(id);
  const { data: deptData } = useDepartments();
  const createMut = useCreateDoctor();
  const updateMut = useUpdateDoctor();
  const departments = deptData?.departments || [];

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    specialization: '', licenseNo: '', department: '', consultationFee: 0,
    qualifications: '', yearsOfExperience: 0, gender: '', dateOfBirth: '',
    address: '', bio: '', isAvailable: true,
    languages: [],
    schedule: DAYS.map(d => ({ day: d, startTime: '09:00', endTime: '17:00', slotDuration: 15, isAvailable: d !== 'sunday' })),
  });

  const formInitialized = useRef(false);
  useEffect(() => {
    if (isEdit && existingData?.doctor && !formInitialized.current) {
      const d = existingData.doctor;
      formInitialized.current = true;
      setForm({
        name: d.user?.name || '', email: d.user?.email || '', password: '', phone: d.user?.phone || '',
        specialization: d.specialization || '', licenseNo: d.licenseNo || '', department: d.department?._id || '', consultationFee: d.consultationFee || 0,
        qualifications: d.qualifications?.join(', ') || '', yearsOfExperience: d.yearsOfExperience || 0, gender: d.gender || '', dateOfBirth: d.dateOfBirth ? d.dateOfBirth.split('T')[0] : '',
        address: d.address || '', bio: d.bio || '', isAvailable: d.isAvailable,
        languages: d.languages || [],
        schedule: d.schedule?.length ? d.schedule : DAYS.map(d => ({ day: d, startTime: '09:00', endTime: '17:00', slotDuration: 15, isAvailable: d !== 'sunday' })),
      });
    }
  }, [isEdit, existingData]);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const toggleLang = (lang) => {
    setForm(prev => ({ ...prev, languages: prev.languages.includes(lang) ? prev.languages.filter(l => l !== lang) : [...prev.languages, lang] }));
  };

  const toggleDay = (day) => {
    setForm(prev => ({ ...prev, schedule: prev.schedule.map(s => s.day === day ? { ...s, isAvailable: !s.isAvailable } : s) }));
  };

  const updateSlot = (day, field, value) => {
    setForm(prev => ({ ...prev, schedule: prev.schedule.map(s => s.day === day ? { ...s, [field]: value } : s) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      qualifications: form.qualifications.split(',').map(q => q.trim()).filter(Boolean),
    };
    delete data.password;
    if (!isEdit && !form.password) { alert('Password is required for new doctors'); return; }
    try {
      if (isEdit) {
        await updateMut.mutateAsync({ id, data });
      } else {
        await createMut.mutateAsync({ ...data, password: form.password });
      }
      navigate('/doctors');
    } catch { /* hook handles errors */ }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/doctors" className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{isEdit ? 'Edit Doctor' : 'Add Doctor'}</h1>
          <p className="text-sm text-muted-foreground">{isEdit ? 'Update doctor profile and information.' : 'Register a new doctor in the system.'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Account Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs font-semibold text-foreground block mb-1">Full Name *</label><Input value={form.name} onChange={handleChange('name')} required placeholder="Dr. John Doe" className="h-9 rounded-xl" /></div>
              <div><label className="text-xs font-semibold text-foreground block mb-1">Email *</label><Input type="email" value={form.email} onChange={handleChange('email')} required placeholder="john@hospital.com" className="h-9 rounded-xl" /></div>
              <div><label className="text-xs font-semibold text-foreground block mb-1">Phone</label><Input value={form.phone} onChange={handleChange('phone')} placeholder="+91 98765 43210" className="h-9 rounded-xl" /></div>
              {!isEdit && <div><label className="text-xs font-semibold text-foreground block mb-1">Password *</label><Input type="password" value={form.password} onChange={handleChange('password')} required={!isEdit} placeholder="Min 6 characters" className="h-9 rounded-xl" /></div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Professional Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><label className="text-xs font-semibold text-foreground block mb-1">Specialization *</label><Input value={form.specialization} onChange={handleChange('specialization')} required placeholder="Cardiology" className="h-9 rounded-xl" /></div>
              <div><label className="text-xs font-semibold text-foreground block mb-1">License Number *</label><Input value={form.licenseNo} onChange={handleChange('licenseNo')} required placeholder="MCI-12345" className="h-9 rounded-xl" /></div>
              <div><label className="text-xs font-semibold text-foreground block mb-1">Department</label><select value={form.department} onChange={handleChange('department')} className="flex h-9 w-full rounded-xl border border-border/20 bg-muted/15 px-3 text-xs outline-none cursor-pointer"><option value="">Select department</option>{departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-semibold text-foreground block mb-1">Consultation Fee (₹)</label><Input type="number" value={form.consultationFee} onChange={handleChange('consultationFee')} min="0" className="h-9 rounded-xl" /></div>
                <div><label className="text-xs font-semibold text-foreground block mb-1">Years of Experience</label><Input type="number" value={form.yearsOfExperience} onChange={handleChange('yearsOfExperience')} min="0" className="h-9 rounded-xl" /></div>
              </div>
              <div><label className="text-xs font-semibold text-foreground block mb-1">Qualifications (comma-separated)</label><Input value={form.qualifications} onChange={handleChange('qualifications')} placeholder="MBBS, MD, DM Cardiology" className="h-9 rounded-xl" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs font-semibold text-foreground block mb-1">Gender</label><select value={form.gender} onChange={handleChange('gender')} className="flex h-9 w-full rounded-xl border border-border/20 bg-muted/15 px-3 text-xs outline-none cursor-pointer"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                <div><label className="text-xs font-semibold text-foreground block mb-1">Date of Birth</label><Input type="date" value={form.dateOfBirth} onChange={handleChange('dateOfBirth')} className="h-9 rounded-xl" /></div>
              </div>
              <div><label className="text-xs font-semibold text-foreground block mb-1">Address</label><Input value={form.address} onChange={handleChange('address')} placeholder="Full address" className="h-9 rounded-xl" /></div>
              <div><label className="text-xs font-semibold text-foreground block mb-1">Bio / Description</label><textarea value={form.bio} onChange={handleChange('bio')} rows={3} placeholder="Short professional bio..." className="w-full rounded-xl border border-border/20 bg-muted/15 px-3 py-2 text-xs outline-none focus-visible:bg-background focus:ring-1 focus:ring-primary resize-none" /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-semibold">Languages</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {LANG_OPTIONS.map(l => (
                  <button key={l} type="button" onClick={() => toggleLang(l)} className={cn("px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none", form.languages.includes(l) ? "bg-primary text-primary-foreground border-primary" : "bg-muted/10 hover:bg-muted/20 border-border/10 text-muted-foreground hover:text-foreground")}>
                    {l}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-sm font-semibold">Weekly Schedule</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {form.schedule.map(s => (
                  <div key={s.day} className={cn("rounded-xl border p-3 transition-colors", s.isAvailable ? "border-border/40" : "border-border/10 bg-muted/20")}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold capitalize">{s.day}</span>
                      <button type="button" onClick={() => toggleDay(s.day)} className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors", s.isAvailable ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{s.isAvailable ? 'ON' : 'OFF'}</button>
                    </div>
                    {s.isAvailable && (
                      <div className="space-y-1.5">
                        <Input type="time" value={s.startTime} onChange={e => updateSlot(s.day, 'startTime', e.target.value)} className="h-7 rounded-lg text-[10px] px-2" />
                        <Input type="time" value={s.endTime} onChange={e => updateSlot(s.day, 'endTime', e.target.value)} className="h-7 rounded-lg text-[10px] px-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center gap-3 pt-6">
          <Button type="submit" disabled={createMut.isPending || updateMut.isPending} className="rounded-xl"><Save className="mr-2 h-4 w-4" /> {isEdit ? 'Update Doctor' : 'Create Doctor'}</Button>
          <Link to="/doctors"><Button type="button" variant="outline" className="rounded-xl"><X className="mr-2 h-4 w-4" /> Cancel</Button></Link>
        </div>
      </form>
    </div>
  );
}
