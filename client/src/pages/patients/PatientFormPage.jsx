import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useCreatePatient, usePatient, useUpdatePatient } from '../../hooks/usePatients';
import { useToast } from '../../hooks/useToast';
import { saveForm, clearForm } from '../../store/slices/patientFormSlice';
import { patientSchema } from '../../lib/validations/patientSchema';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { DatePicker } from '@heroui/react';
import { parseDate } from '@internationalized/date';
import { ArrowLeft, UserPlus, X, Shield, Heart, Phone, MapPin } from 'lucide-react';

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
  const { id } = useParams();
  const isEdit = !!id;
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();
  const { data: patientData, isLoading: patientLoading, error: patientError } = usePatient(id);
  const toast = useToast();
  const dispatch = useDispatch();
  const persistedForm = useSelector((state) => state.patientForm?.formData || null);

  const blankForm = {
    firstName: '', lastName: '', dob: '', gender: 'male',
    phone: '', email: '',
    address: { street: '', city: '', state: '', zip: '', pincode: '' },
    bloodGroup: '', allergies: [],
    emergencyContact: { name: '', phone: '', relation: '' },
    aadhaar: '', maritalStatus: '', occupation: '',
    medicalHistory: { conditions: [], surgeries: [], familyHistory: [], immunizations: [], habits: { smoking: '', alcohol: '', tobacco: '' } },
    insurance: { provider: '', policyNo: '', expiry: '' },
  };

  const [form, setForm] = useState(blankForm);

  useEffect(() => {
    if (!isEdit && persistedForm) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(persistedForm);
    }
  }, []);

  useEffect(() => {
    if (patientData?.patient) {
      const p = patientData.patient;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        dob: p.dob ? p.dob.split('T')[0] : '',
        gender: p.gender || 'male',
        phone: p.phone || '',
        email: p.email || '',
        address: {
          street: p.address?.street || '',
          city: p.address?.city || '',
          state: p.address?.state || '',
          zip: p.address?.zip || '',
          pincode: p.address?.pincode || '',
        },
        bloodGroup: p.bloodGroup || '',
        allergies: p.allergies || [],
        emergencyContact: {
          name: p.emergencyContact?.name || '',
          phone: p.emergencyContact?.phone || '',
          relation: p.emergencyContact?.relation || '',
        },
        aadhaar: p.aadhaar || '',
        maritalStatus: p.maritalStatus || '',
        occupation: p.occupation || '',
        medicalHistory: {
          conditions: p.medicalHistory?.conditions || [],
          surgeries: p.medicalHistory?.surgeries || [],
          familyHistory: p.medicalHistory?.familyHistory || [],
          immunizations: p.medicalHistory?.immunizations || [],
          habits: {
            smoking: p.medicalHistory?.habits?.smoking || '',
            alcohol: p.medicalHistory?.habits?.alcohol || '',
            tobacco: p.medicalHistory?.habits?.tobacco || '',
          },
        },
        insurance: {
          provider: p.insurance?.provider || '',
          policyNo: p.insurance?.policyNo || '',
          expiry: p.insurance?.expiry ? p.insurance.expiry.split('T')[0] : '',
        },
      });
    }
  }, [patientData]);

  useEffect(() => {
    if (!isEdit) {
      const isEmpty = !form.firstName && !form.lastName && !form.phone;
      if (!isEmpty) {
        const timer = setTimeout(() => {
          dispatch(saveForm(form));
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [form, isEdit, dispatch]);

  useEffect(() => {
    if (patientError) toast.error(patientError.message || 'Failed to load patient');
  }, [patientError]);

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

  let dateValue = null;
  if (form.dob) {
    try {
      dateValue = parseDate(form.dob);
    } catch (e) {
      console.error("Error parsing DOB:", e);
    }
  }

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

  const mutation = isEdit ? updatePatient : createPatient;
  const isPending = mutation.isPending;

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = patientSchema.safeParse(form);
    if (!result.success) {
      const firstError = result.error.errors[0];
      const fieldLabel = firstError.path.length > 0
        ? firstError.path.join(' ').replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
        : 'Validation';
      toast.error(`${fieldLabel}: ${firstError.message}`);
      return;
    }

    let rawPhone = form.phone.trim();
    if (/^\d{10}$/.test(rawPhone)) {
      rawPhone = '+91' + rawPhone;
      update('phone', rawPhone);
    }

    if (!rawPhone.startsWith('+')) {
      toast.error('Mobile number must start with a "+" and country code (e.g., +91 98765 43210)');
      return;
    }

    const phoneDigits = rawPhone.substring(1).replace(/[^0-9]/g, '');
    if (phoneDigits.length < 11 || phoneDigits.length > 13) {
      toast.error('Mobile number must have exactly 10 digits after the country code prefix (e.g., +91 98765 43210)');
      return;
    }

    if (form.email && form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        toast.error('Please enter a valid email address');
        return;
      }
    }

    if (form.emergencyContact.phone && form.emergencyContact.phone.trim()) {
      let ecPhone = form.emergencyContact.phone.trim();
      if (/^\d{10}$/.test(ecPhone)) {
        ecPhone = '+91' + ecPhone;
        updateEmergency('phone', ecPhone);
      }
      if (!ecPhone.startsWith('+')) {
        toast.error('Emergency contact phone must start with a "+" and country code (e.g., +91 98765 43210)');
        return;
      }
      const ecDigits = ecPhone.substring(1).replace(/[^0-9]/g, '');
      if (ecDigits.length < 11 || ecDigits.length > 13) {
        toast.error('Emergency contact must have exactly 10 digits after the country code prefix (e.g., +91 98765 43210)');
        return;
      }
    }

    if (form.aadhaar && form.aadhaar.trim()) {
      const aadhaarClean = form.aadhaar.replace(/[^0-9]/g, '');
      if (aadhaarClean.length !== 12) {
        toast.error('Aadhaar number must be exactly 12 digits');
        return;
      }
    }

    if (form.address.pincode && form.address.pincode.trim()) {
      const pinClean = form.address.pincode.replace(/[^0-9]/g, '');
      if (pinClean.length !== 6) {
        toast.error('Pincode must be exactly 6 digits');
        return;
      }
    }

    try {
      if (isEdit) {
        await updatePatient.mutateAsync({ id, data: form });
        dispatch(clearForm());
        toast.success('Patient updated');
        navigate(`/patients/${id}`);
      } else {
        const res = await createPatient.mutateAsync(form);
        dispatch(clearForm());
        toast.success(`Patient registered: ${res.patient.uhid}`);
        navigate(`/patients/${res.patient._id}`);
      }
    } catch (err) {
      if (!isEdit && err.message.includes('already exists')) {
        toast.error('Phone number already registered. Use search to find existing patient.');
      }
    }
  };

  if (isEdit && patientError) {
    return <div className="flex justify-center py-12"><p className="text-destructive font-medium">Failed to load patient</p></div>;
  }

  if (isEdit && patientLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => {
            if (!isEdit) dispatch(clearForm());
            navigate(isEdit ? `/patients/${id}` : '/patients');
          }}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{isEdit ? 'Edit Patient' : 'Register New Patient'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{isEdit ? 'Update patient record' : 'Create a new patient record'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => {
            if (!isEdit) dispatch(clearForm());
            navigate(isEdit ? `/patients/${id}` : '/patients');
          }}>Cancel</Button>
          <Button type="submit" form="patient-form" disabled={isPending}>
            <UserPlus className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">{isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Patient'}</span>
          </Button>
        </div>
      </div>

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
                <div className="col-span-2">
                  <DatePicker
                    label="Date of Birth"
                    isRequired
                    value={dateValue}
                    onChange={(date) => {
                      if (date) {
                        update('dob', date.toString());
                      } else {
                        update('dob', '');
                      }
                    }}
                    showMonthAndYearPickers
                    variant="bordered"
                    className="w-full text-foreground"
                    classNames={{
                      inputWrapper: "h-10 bg-background border-input hover:border-accent focus-within:border-primary shadow-none",
                      label: "text-muted-foreground font-medium text-xs",
                    }}
                  />
                </div>
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
                  <Input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="e.g. +91 98765 43210" required />
                </Field>
                <Field label="Email" className="col-span-2">
                  <Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="e.g. rekha.joshi@email.com" />
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
