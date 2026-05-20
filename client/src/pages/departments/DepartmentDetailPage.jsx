import { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDepartment, useDeleteDepartment, useUpdateDepartment, useAssignDoctor, useRemoveDoctor } from '../../hooks/useDepartments';
import { useDoctors } from '../../hooks/useDoctor';
import { ConfirmDelete } from '../../components/ui/ConfirmDelete';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ArrowLeft, MapPin, Stethoscope, Users, Calendar, Pencil, Trash2, Mail, Phone, DollarSign, Activity, Plus, X, MoreHorizontal, Eye, Crown } from 'lucide-react';
import { displayPhone } from '../../lib/utils';

export function DepartmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useDepartment(id);
  const deleteMut = useDeleteDepartment();
  const updateMut = useUpdateDepartment();
  const assignMut = useAssignDoctor();
  const removeMut = useRemoveDoctor();
  const { data: allDoctors } = useDoctors({ limit: 200 });
  const [showDelete, setShowDelete] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);
  const department = data?.department;
  const doctors = data?.doctors || [];

  useEffect(() => { const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null); }; document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler); }, []);

  const availableDoctors = (allDoctors?.doctors || []).filter(
    d => d.isAvailable !== false && !doctors.some(doc => doc._id === d._id)
  );

  const handleAssign = () => {
    if (!selectedDoctor) return;
    assignMut.mutate({ departmentId: id, doctorId: selectedDoctor }, {
      onSuccess: () => { setShowAssign(false); setSelectedDoctor(''); },
    });
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!department) return <div className="py-12 text-center text-muted-foreground">Department not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/departments" className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer"><ArrowLeft className="h-4 w-4" /></Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">{department.name} <Badge variant={department.isActive !== false ? 'success' : 'secondary'}>{department.isActive !== false ? 'Active' : 'Inactive'}</Badge></h1>
            <p className="text-sm text-muted-foreground">{department.location || 'No location set'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/departments/${department._id}/edit`}><Button variant="outline"><Pencil className="mr-2 h-4 w-4" /> Edit</Button></Link>
          <Button variant="destructive" onClick={() => setShowDelete(true)}><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-[var(--shadow-card)] rounded-2xl bg-card border border-border/50">
            <CardHeader><CardTitle className="text-sm font-semibold">Department Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div><p className="text-xs text-muted-foreground font-semibold">Name</p><p className="text-sm font-medium mt-0.5">{department.name}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Location</p><p className="text-sm font-medium mt-0.5 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {department.location || <span className="text-muted-foreground/50">Not set</span>}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Head Doctor</p><p className="text-sm font-medium mt-0.5 flex items-center gap-1.5"><Stethoscope className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {department.headDoctor?.user?.name || <span className="text-muted-foreground/50">Not assigned</span>}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Phone</p><p className="text-sm font-medium mt-0.5 flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {displayPhone(department.phone)}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Email</p><p className="text-sm font-medium mt-0.5 flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {department.email || <span className="text-muted-foreground/50">Not set</span>}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Revenue</p><p className="text-sm font-semibold mt-0.5 flex items-center gap-1.5"><DollarSign className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> ₹{(department.revenue || 0).toLocaleString('en-IN')}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Status</p><p className="text-sm font-medium mt-0.5 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {department.isActive !== false ? 'Active' : 'Inactive'}</p></div>
                <div><p className="text-xs text-muted-foreground font-semibold">Created</p><p className="text-sm font-medium mt-0.5 flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> {new Date(department.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p></div>
              </div>
              {department.description && (
                <div><p className="text-xs text-muted-foreground font-semibold">Description</p><p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{department.description}</p></div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-card)] rounded-2xl bg-card border border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Doctors ({doctors.length})</CardTitle>
                <Button variant="outline" size="sm" onClick={() => setShowAssign(!showAssign)}><Plus className="mr-1 h-3.5 w-3.5" /> Assign Doctor</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {showAssign && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20 border border-border/30 mb-3">
                  <select value={selectedDoctor} onChange={e => setSelectedDoctor(e.target.value)} className="flex-1 rounded-xl border border-border/30 bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all">
                    <option value="">Select a doctor...</option>
                    {availableDoctors.map(d => (
                      <option key={d._id} value={d._id}>{d.user?.name} — {d.specialization}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={handleAssign} disabled={!selectedDoctor || assignMut.isPending}>Assign</Button>
                  <button onClick={() => { setShowAssign(false); setSelectedDoctor(''); }} className="p-2 text-muted-foreground hover:text-foreground cursor-pointer"><X className="h-4 w-4" /></button>
                </div>
              )}
              {doctors.length === 0 ? (
                <p className="text-sm text-muted-foreground/50 text-center py-4">No doctors in this department</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {doctors.map(doc => (
                    <div key={doc._id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                      <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-sm bg-primary">{doc.user?.name?.charAt(0) || '?'}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{doc.user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><Mail className="h-3 w-3 shrink-0" /> {doc.user?.email}</p>
                      </div>
                      <div className="relative shrink-0">
                        <button onClick={() => setOpenMenu(openMenu === doc._id ? null : doc._id)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                        {openMenu === doc._id && (
                          <div ref={menuRef} className="absolute right-0 bottom-full mb-1 z-[100] w-40 rounded-xl border border-border/50 bg-card shadow-xl dark:bg-[#1c1c1f] overflow-hidden">
                            <Link to={`/doctors/${doc._id}`} className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50 dark:hover:bg-[#27272a] transition-colors"><Eye className="h-3.5 w-3.5 text-muted-foreground" /> View</Link>
                            <button onClick={() => { updateMut.mutate({ id, headDoctor: doc._id }); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-foreground hover:bg-muted/50 dark:hover:bg-[#27272a] transition-colors cursor-pointer"><Crown className="h-3.5 w-3.5 text-amber-500" /> Make Head</button>
                            <button onClick={() => { removeMut.mutate({ departmentId: id, doctorId: doc._id }); setOpenMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-[#2a1415] transition-colors cursor-pointer"><X className="h-3.5 w-3.5" /> Remove</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-[var(--shadow-card)] rounded-2xl bg-card border border-border/50">
            <CardHeader><CardTitle className="text-sm font-semibold">Quick Stats</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20"><span className="text-xs font-semibold text-muted-foreground">Total Doctors</span><span className="text-lg font-bold">{doctors.length}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20"><span className="text-xs font-semibold text-muted-foreground">Monthly Revenue</span><span className="text-lg font-bold">₹{(department.revenue || 0).toLocaleString('en-IN')}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20"><span className="text-xs font-semibold text-muted-foreground">Head Doctor</span><span className="text-sm font-bold">{department.headDoctor?.user?.name || '—'}</span></div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20"><span className="text-xs font-semibold text-muted-foreground">Status</span><Badge variant={department.isActive !== false ? 'success' : 'secondary'}>{department.isActive !== false ? 'Active' : 'Inactive'}</Badge></div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDelete isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={() => { deleteMut.mutate(department._id, { onSuccess: () => navigate('/departments') }); setShowDelete(false); }} title="Delete Department" message={`Delete "${department.name}"? This will unlink all doctors in this department but will not delete them.`} />
    </div>
  );
}
