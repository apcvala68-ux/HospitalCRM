import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreatePatient, usePatientSearch } from '../../hooks/usePatients';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, UserPlus, Search, X, Shield, Heart, Phone, MapPin } from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function Section({ icon: Icon, title, children, className = '' }) {
  return (
    <div className={`rounded-xl border bg-card ${className}`}>
      <div className="flex items-center gap-2 border-b px-4 py-3">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children, className = '' }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function PatientFormPage() {
  const navigate = useNavigate();
  const createPatient = useCreatePatient();
  const toast = useToast();

  const [lookupPhone, setLookupPhone] = useState('');
  const { data: searchResults } = usePatientSearch(lookupPhone);

  const [form, setForm] = useState({
    firstName: '', lastName: '', dob: '', gender: 'male',
    phone: '', email: '',
    address: { street: '', city: '', state: '', zip: '', pincode: '' },
    bloodGroup: '', allergies: [],
    emergencyContact: { name: '', phone: '', relation: '' },
    aadhaar: '', maritalStatus: '', occupation: '',
    medicalHistory: { conditions: [], surgeries: [], familyHistory: [], immunizations: [], habits: { smoking: '', alcohol: '', tobacco: '' } },
    insurance: { provider: '', policyNo: '', expiry: '' },
  });

  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [surgeryInput, setSurgeryInput] = useState('');
  const [familyHistoryInput, setFamilyHistoryInput] = useState('');
  const [immunizationInput, setImmunizationInput] = useState('');

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const updateAddress = (field, value) => setForm(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
  const updateEmergency = (field, value) => setForm(prev => ({ ...prev, emergencyContact: { ...prev.emergencyContact, [field]: value } }));
  const updateHabits = (field, value) => update('medicalHistory', { ...form.medicalHistory, habits: { ...form.medicalHistory.habits, [field]: value } });
  const updateInsurance = (field, value) => update('insurance', { ...form.insurance, [field]: value });

  const addAllergy = () => {
    if (allergyInput.trim() && !form.allergies.includes(allergyInput.trim())) {
      update('allergies', [...form.allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };
  const removeAllergy = (a) => update('allergies', form.allergies.filter(x => x !== a));

  const addMedField = (field, input, setInput) => {
    if (input.trim() && !form.medicalHistory[field].includes(input.trim())) {
      update('medicalHistory', { ...form.medicalHistory, [field]: [...form.medicalHistory[field], input.trim()] });
      setInput('');
    }
  };
  const removeMedField = (field, item) => update('medicalHistory', { ...form.medicalHistory, [field]: form.medicalHistory[field].filter(x => x !== item) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.dob || !form.phone) {
      toast.error('First name, last name, DOB, and phone are required');
      return;
    }
    try {
      const res = await createPatient.mutateAsync(form);
      toast.success(`Patient registered: ${res.patient.uhid}`);
      navigate(`/patients/${res.patient._id}`);
    } catch (err) {
      if (err.message.includes('already exists')) {
        toast.error('Phone number already registered. Use search to find existing patient.');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Register New Patient</h1>
            <p className="text-sm text-muted-foreground">Create a new patient record</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/patients')}>Cancel</Button>
          <Button type="submit" form="patient-form" disabled={createPatient.isPending}>
            <UserPlus className="mr-2 h-4 w-4" />
            {createPatient.isPending ? 'Registering...' : 'Register Patient'}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Quick lookup — search by phone number..." value={lookupPhone} onChange={(e) => setLookupPhone(e.target.value)} className="pl-10" />
            </div>
          </div>
          {searchResults?.patients?.length > 0 && (
            <div className="mt-2 space-y-1">
              {searchResults.patients.map((p) => (
                <div key={p._id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                  <span>{p.firstName} {p.lastName} — {p.uhid} ({p.phone})</span>
                  <Button size="sm" variant="outline" onClick={() => navigate(`/patients/${p._id}`)}>View</Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <form id="patient-form" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <Section icon={UserPlus} title="Personal Information">
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" required>
                  <Input value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required />
                </Field>
                <Field label="Last Name" required>
                  <Input value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required />
                </Field>
                <Field label="Date of Birth" required>
                  <Input type="date" value={form.dob} onChange={(e) => update('dob', e.target.value)} required />
                </Field>
                <Field label="Gender" required>
                  <select value={form.gender} onChange={(e) => update('gender', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Blood Group">
                  <select value={form.bloodGroup} onChange={(e) => update('bloodGroup', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </Field>
                <Field label="Phone" required>
                  <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} required />
                </Field>
                <Field label="Email" className="col-span-2">
                  <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
                </Field>
              </div>
            </Section>

            <Section icon={MapPin} title="Address">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Street" className="col-span-2">
                  <Input value={form.address.street} onChange={(e) => updateAddress('street', e.target.value)} />
                </Field>
                <Field label="City">
                  <Input value={form.address.city} onChange={(e) => updateAddress('city', e.target.value)} />
                </Field>
                <Field label="State">
                  <Input value={form.address.state} onChange={(e) => updateAddress('state', e.target.value)} />
                </Field>
                <Field label="ZIP Code">
                  <Input value={form.address.zip} onChange={(e) => updateAddress('zip', e.target.value)} />
                </Field>
                <Field label="Pincode">
                  <Input value={form.address.pincode} onChange={(e) => updateAddress('pincode', e.target.value)} />
                </Field>
              </div>
            </Section>

            <Section icon={Phone} title="Emergency Contact">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Name">
                  <Input value={form.emergencyContact.name} onChange={(e) => updateEmergency('name', e.target.value)} />
                </Field>
                <Field label="Phone">
                  <Input value={form.emergencyContact.phone} onChange={(e) => updateEmergency('phone', e.target.value)} />
                </Field>
                <Field label="Relation">
                  <Input value={form.emergencyContact.relation} onChange={(e) => updateEmergency('relation', e.target.value)} />
                </Field>
              </div>
            </Section>

          </div>

          <div className="space-y-4">
            <Section icon={Shield} title="Insurance">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Provider">
                  <Input value={form.insurance.provider} onChange={(e) => updateInsurance('provider', e.target.value)} placeholder="e.g. MediAssist" />
                </Field>
                <Field label="Policy No">
                  <Input value={form.insurance.policyNo} onChange={(e) => updateInsurance('policyNo', e.target.value)} />
                </Field>
                <Field label="Expiry">
                  <Input type="date" value={form.insurance.expiry} onChange={(e) => updateInsurance('expiry', e.target.value)} />
                </Field>
              </div>
            </Section>

            <Section icon={Heart} title="Medical Info & History">
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Aadhaar No">
                    <Input value={form.aadhaar} onChange={(e) => update('aadhaar', e.target.value)} placeholder="XXXX-XXXX-XXXX" />
                  </Field>
                  <Field label="Marital Status">
                    <select value={form.maritalStatus} onChange={(e) => update('maritalStatus', e.target.value)} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                      <option value="">Select</option>
                      {['single','married','divorced','widowed'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Occupation">
                    <Input value={form.occupation} onChange={(e) => update('occupation', e.target.value)} />
                  </Field>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Allergies</label>
                  <div className="flex gap-2">
                    <Input placeholder="Add allergy..." value={allergyInput} onChange={(e) => setAllergyInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())} className="h-8 text-sm" />
                    <Button type="button" variant="outline" size="sm" onClick={addAllergy}>Add</Button>
                  </div>
                  {form.allergies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {form.allergies.map((a) => (
                        <Badge key={a} variant="destructive" className="gap-1 text-xs">{a}<button type="button" onClick={() => removeAllergy(a)} className="cursor-pointer"><X className="h-3 w-3" /></button></Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Chronic Conditions</label>
                  <div className="flex gap-2">
                    <Input placeholder="e.g. Diabetes..." value={conditionInput} onChange={(e) => setConditionInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedField('conditions', conditionInput, setConditionInput))} className="h-8 text-sm" />
                    <Button type="button" variant="outline" size="sm" onClick={() => addMedField('conditions', conditionInput, setConditionInput)}>Add</Button>
                  </div>
                  {form.medicalHistory.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {form.medicalHistory.conditions.map((c, i) => (
                        <Badge key={i} variant="outline" className="gap-1 text-xs">{c}<button type="button" onClick={() => removeMedField('conditions', c)} className="cursor-pointer"><X className="h-3 w-3" /></button></Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Past Surgeries</label>
                  <div className="flex gap-2">
                    <Input placeholder="e.g. Appendectomy..." value={surgeryInput} onChange={(e) => setSurgeryInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedField('surgeries', surgeryInput, setSurgeryInput))} className="h-8 text-sm" />
                    <Button type="button" variant="outline" size="sm" onClick={() => addMedField('surgeries', surgeryInput, setSurgeryInput)}>Add</Button>
                  </div>
                  {form.medicalHistory.surgeries.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {form.medicalHistory.surgeries.map((s, i) => (
                        <Badge key={i} variant="secondary" className="gap-1 text-xs">{s}<button type="button" onClick={() => removeMedField('surgeries', s)} className="cursor-pointer"><X className="h-3 w-3" /></button></Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Family History</label>
                    <div className="flex gap-2">
                      <Input placeholder="e.g. Father - DM..." value={familyHistoryInput} onChange={(e) => setFamilyHistoryInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedField('familyHistory', familyHistoryInput, setFamilyHistoryInput))} className="h-8 text-sm" />
                      <Button type="button" variant="outline" size="sm" onClick={() => addMedField('familyHistory', familyHistoryInput, setFamilyHistoryInput)}>+</Button>
                    </div>
                    {form.medicalHistory.familyHistory.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {form.medicalHistory.familyHistory.map((f, i) => (
                          <Badge key={i} variant="info" className="gap-1 text-xs">{f}<button type="button" onClick={() => removeMedField('familyHistory', f)} className="cursor-pointer"><X className="h-3 w-3" /></button></Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Immunizations</label>
                    <div className="flex gap-2">
                      <Input placeholder="e.g. Hep B..." value={immunizationInput} onChange={(e) => setImmunizationInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addMedField('immunizations', immunizationInput, setImmunizationInput))} className="h-8 text-sm" />
                      <Button type="button" variant="outline" size="sm" onClick={() => addMedField('immunizations', immunizationInput, setImmunizationInput)}>+</Button>
                    </div>
                    {form.medicalHistory.immunizations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {form.medicalHistory.immunizations.map((im, i) => (
                          <Badge key={i} variant="success" className="gap-1 text-xs">{im}<button type="button" onClick={() => removeMedField('immunizations', im)} className="cursor-pointer"><X className="h-3 w-3" /></button></Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t pt-3">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Habits</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Smoking">
                      <select value={form.medicalHistory.habits.smoking} onChange={(e) => updateHabits('smoking', e.target.value)} className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs">
                        <option value="">Select</option>
                        <option value="never">Never</option>
                        <option value="former">Former</option>
                        <option value="current">Current</option>
                      </select>
                    </Field>
                    <Field label="Alcohol">
                      <select value={form.medicalHistory.habits.alcohol} onChange={(e) => updateHabits('alcohol', e.target.value)} className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs">
                        <option value="">Select</option>
                        <option value="never">Never</option>
                        <option value="occasional">Occasional</option>
                        <option value="regular">Regular</option>
                      </select>
                    </Field>
                    <Field label="Tobacco">
                      <select value={form.medicalHistory.habits.tobacco} onChange={(e) => updateHabits('tobacco', e.target.value)} className="flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs">
                        <option value="">Select</option>
                        <option value="never">Never</option>
                        <option value="former">Former</option>
                        <option value="current">Current</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </form>
    </div>
  );
}
