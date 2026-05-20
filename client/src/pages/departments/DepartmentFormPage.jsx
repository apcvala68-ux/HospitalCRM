import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useDepartment, useCreateDepartment, useUpdateDepartment, useRemoveDoctor } from '../../hooks/useDepartments';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Save, Building2, Stethoscope, X } from 'lucide-react';

function DepartmentForm({ department, doctors, isEdit, onSubmit, isPending }) {
  const [form, setForm] = useState({
    name: department?.name || '',
    description: department?.description || '',
    location: department?.location || '',
    phone: department?.phone || '',
    email: department?.email || '',
    headDoctor: department?.headDoctor?._id || department?.headDoctor || '',
    isActive: department?.isActive !== false,
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (!payload.headDoctor) delete payload.headDoctor;
    onSubmit(payload);
  };

  const set = (k) => (v) => setForm(p => ({ ...p, [k]: typeof v === 'function' ? v(p[k]) : v }));

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Department Name *</label>
        <Input value={form.name} onChange={e => set('name')(e.target.value)} placeholder="e.g. Cardiology" className={errors.name ? 'border-red-500' : ''} />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Description</label>
        <textarea value={form.description} onChange={e => set('description')(e.target.value)} placeholder="Department description..." rows={3} className="w-full rounded-xl border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Location</label>
        <Input value={form.location} onChange={e => set('location')(e.target.value)} placeholder="3rd Floor, East Wing" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Phone</label>
        <Input value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="+91-1234567890" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email</label>
        <Input value={form.email} onChange={e => set('email')(e.target.value)} placeholder="cardiology@hospital.com" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Status</label>
        <label className="flex items-center gap-2 cursor-pointer mt-1">
          <input type="checkbox" checked={form.isActive} onChange={e => set('isActive')(e.target.checked)} className="w-4 h-4 rounded border-border/30 text-primary focus:ring-primary/30" />
          <span className="text-xs font-semibold text-muted-foreground">Department is active</span>
        </label>
      </div>
      {isEdit && doctors.length > 0 && (
        <div>
          <label className="block text-xs font-semibold text-muted-foreground mb-2">Head Doctor</label>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer text-sm p-1.5 rounded-lg hover:bg-muted/20">
              <input type="radio" name="headDoctor" value="" checked={!form.headDoctor} onChange={() => set('headDoctor')('')} className="w-3.5 h-3.5 text-primary" />
              <span className="text-muted-foreground">None</span>
            </label>
            {doctors.map(doc => (
              <label key={doc._id} className="flex items-center gap-2 cursor-pointer text-sm p-1.5 rounded-lg hover:bg-muted/20">
                <input type="radio" name="headDoctor" value={doc._id} checked={form.headDoctor === doc._id} onChange={() => set('headDoctor')(doc._id)} className="w-3.5 h-3.5 text-primary" />
                <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[9px] shadow-sm bg-primary">{doc.user?.name?.charAt(0) || '?'}</div>
                <span className="font-medium">{doc.user?.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending}><Save className="mr-2 h-4 w-4" /> {isEdit ? 'Update' : 'Create'} Department</Button>
        <Link to="/departments"><Button type="button" variant="outline">Cancel</Button></Link>
      </div>
    </form>
  );
}

export function DepartmentFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data, isLoading: loadingData } = useDepartment(id);
  const createMut = useCreateDepartment();
  const updateMut = useUpdateDepartment();
  const removeMut = useRemoveDoctor();

  const handleSubmit = (payload) => {
    if (isEdit) {
      updateMut.mutate({ id, ...payload }, { onSuccess: () => navigate(`/departments/${id}`) });
    } else {
      createMut.mutate(payload, { onSuccess: (res) => navigate(`/departments/${res.department._id}`) });
    }
  };

  if (isEdit && loadingData) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  const doctors = data?.doctors || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/departments" className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer"><ArrowLeft className="h-4 w-4" /></Link>
        <div><h1 className="text-2xl font-bold tracking-tight text-foreground">{isEdit ? 'Edit Department' : 'New Department'}</h1><p className="text-sm text-muted-foreground">{isEdit ? 'Update department information' : 'Add a new hospital department'}</p></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="shadow-[var(--shadow-card)] rounded-2xl bg-card border border-border/50">
            <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Department Details</CardTitle></CardHeader>
            <CardContent>
              <DepartmentForm key={isEdit ? id : 'create'} department={data?.department} doctors={doctors} isEdit={isEdit} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending} />
            </CardContent>
          </Card>
        </div>

        {isEdit && (
          <div>
            <Card className="shadow-[var(--shadow-card)] rounded-2xl bg-card border border-border/50">
              <CardHeader><CardTitle className="text-sm font-semibold flex items-center gap-2"><Stethoscope className="h-4 w-4 text-primary" /> Doctors ({doctors.length})</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {doctors.length === 0 ? (
                  <p className="text-sm text-muted-foreground/50 text-center py-4">No doctors assigned</p>
                ) : (
                  doctors.map(doc => (
                    <div key={doc._id} className="flex items-center gap-2 p-2 rounded-xl bg-muted/20 text-sm">
                      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[10px] shadow-sm bg-primary">{doc.user?.name?.charAt(0) || '?'}</div>
                      <span className="flex-1 truncate font-medium">{doc.user?.name}</span>
                      <Link to={`/doctors/${doc._id}/edit`} className="text-xs text-primary hover:underline shrink-0">Edit</Link>
                      <button onClick={() => removeMut.mutate({ departmentId: id, doctorId: doc._id })} className="text-red-500 hover:text-red-700 cursor-pointer shrink-0" title="Remove from department"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
