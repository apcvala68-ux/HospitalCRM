import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { ICD10Search } from '../icd10/ICD10Search';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, X, Stethoscope, Pill, Beaker, Search, Clock, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

function useMedicineSearch(q) {
  return useQuery({
    queryKey: ['medicines', 'search', q],
    queryFn: () => api.get(`/pharmacy/medicines?search=${encodeURIComponent(q)}&limit=10`),
    enabled: q?.length >= 2,
  });
}

const FREQ_PRESETS = ['OD', 'BD', 'TDS', 'QID', 'SOS', 'PRN', 'HS', 'STAT'];
const DURATION_PRESETS = ['3 days', '5 days', '7 days', '10 days', '14 days', '21 days', '1 month', '2 months', '3 months', 'Continue'];
const ROUTE_PRESETS = ['oral', 'sublingual', 'topical', 'inhalation', 'iv', 'im', 'sc', 'rectal', 'eye', 'ear', 'nasal'];
const COMMON_LAB_TESTS = ['CBC', 'Blood Sugar Fasting', 'Blood Sugar PP', 'HbA1c', 'Lipid Profile', 'LFT', 'KFT', 'Thyroid Profile', 'Urine Routine', 'ECG', 'Chest X-Ray', 'Vitamin D', 'Vitamin B12'];

export function PrescriptionForm({ onSubmit, isSubmitting, examNotes }) {
  const [diagnosis, setDiagnosis] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [labTests, setLabTests] = useState([]);
  const [notes, setNotes] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const [medForm, setMedForm] = useState({ name: '', dosage: '', frequency: '', duration: '', route: 'oral', instructions: '' });
  const [medSearch, setMedSearch] = useState('');
  const [showMedDropdown, setShowMedDropdown] = useState(false);
  const [showLabDropdown, setShowLabDropdown] = useState(false);
  const [labInput, setLabInput] = useState('');

  const { data: medResults, isLoading: isMedLoading, error: medError } = useMedicineSearch(medSearch);
  const toast = useToast();
  const dropdownRef = useRef(null);
  const labDropdownRef = useRef(null);

  useEffect(() => {
    if (medError) toast.error(medError.message || 'Failed to load medicines');
  }, [medError]);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowMedDropdown(false);
      if (labDropdownRef.current && !labDropdownRef.current.contains(e.target)) setShowLabDropdown(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addMedicine = () => {
    if (!medForm.name) return;
    setMedicines([...medicines, { ...medForm }]);
    setMedForm({ name: '', dosage: '', frequency: '', duration: '', route: 'oral', instructions: '' });
    setMedSearch('');
    setShowMedDropdown(false);
  };

  const removeMedicine = (i) => setMedicines(medicines.filter((_, idx) => idx !== i));

  const addLabTest = (name) => {
    const testName = name?.trim() || labInput.trim();
    if (!testName) return;
    if (labTests.find(t => t.testName.toLowerCase() === testName.toLowerCase())) return;
    setLabTests([...labTests, { testName, instructions: '' }]);
    setLabInput('');
    setShowLabDropdown(false);
  };

  const removeLabTest = (i) => setLabTests(labTests.filter((_, idx) => idx !== i));

  const handleSubmit = (e) => {
    e.preventDefault();
    const allNotes = examNotes ? `${examNotes}${notes ? '\n\n' + notes : ''}` : notes;
    onSubmit({
      diagnosis,
      medicines,
      labTests,
      notes: allNotes || undefined,
      followUpDate: followUpDate || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Diagnosis */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Stethoscope className="h-4 w-4" />Diagnosis (ICD-10)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ICD10Search onSelect={(d) => { if (!diagnosis.find((x) => x.code === d.code)) setDiagnosis([...diagnosis, d]); }} selected={diagnosis} />
          {diagnosis.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {diagnosis.map((d, i) => (
                <Badge key={i} variant="secondary" className="gap-1.5 px-2 py-1">
                  <span className="font-mono text-xs">{d.code}</span>
                  <span className="text-xs">{d.description}</span>
                  <button type="button" onClick={() => setDiagnosis(diagnosis.filter((_, idx) => idx !== i))} className="cursor-pointer hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medicines */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Pill className="h-4 w-4" />Medicines</CardTitle>
            {medicines.length > 0 && <Badge variant="outline">{medicines.length}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div ref={dropdownRef} className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search medicine (e.g. Paracetamol)..."
                value={medSearch}
                onChange={(e) => { setMedSearch(e.target.value); setShowMedDropdown(true); setMedForm({ ...medForm, name: e.target.value }); }}
                onFocus={() => setShowMedDropdown(true)}
                className="pl-10"
              />
            </div>
            {showMedDropdown && medSearch.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-popover shadow-lg z-50">
                {isMedLoading ? (
                  <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </div>
                ) : medError ? (
                  <div className="p-4 text-sm text-destructive">Failed to load medicines</div>
                ) : medResults?.medicines?.length > 0 ? (
                  medResults.medicines.map((m) => {
                    return (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => {
                        setMedForm({ ...medForm, name: m.name, dosage: m.dosage || '' });
                        setMedSearch(m.name);
                        setShowMedDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent flex items-center justify-between"
                    >
                      <span className="font-medium">{m.name}</span>
                      <span className="text-xs text-muted-foreground">{m.genericName || m.category || ''}</span>
                    </button>
                    );
                  })
                ) : null}
                </div>
            )}
          </div>

          {medForm.name && (
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <div className="grid grid-cols-6 gap-2">
                <Input placeholder="Dosage (e.g. 500mg)" value={medForm.dosage} onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })} className="col-span-1" />
                <select value={medForm.frequency} onChange={(e) => setMedForm({ ...medForm, frequency: e.target.value })} className="flex h-9 rounded-md border border-input bg-background px-2 text-sm col-span-1">
                  <option value="">Frequency</option>
                  {FREQ_PRESETS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
                <select value={medForm.duration} onChange={(e) => setMedForm({ ...medForm, duration: e.target.value })} className="flex h-9 rounded-md border border-input bg-background px-2 text-sm col-span-1">
                  <option value="">Duration</option>
                  {DURATION_PRESETS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select value={medForm.route} onChange={(e) => setMedForm({ ...medForm, route: e.target.value })} className="flex h-9 rounded-md border border-input bg-background px-2 text-sm capitalize col-span-1">
                  {ROUTE_PRESETS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <Input placeholder="Instructions (optional)" value={medForm.instructions} onChange={(e) => setMedForm({ ...medForm, instructions: e.target.value })} className="col-span-1" />
                <Button type="button" size="sm" onClick={addMedicine} className="col-span-1"><Plus className="h-4 w-4 mr-1" />Add</Button>
              </div>
            </div>
          )}

          {medicines.length > 0 && (
            <div className="space-y-1.5">
              {medicines.map((m, i) => (
                <div key={i} className="flex items-start justify-between rounded-lg border p-2.5 text-sm hover:bg-muted/30 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-primary">{i + 1}.</span>
                      <span className="font-medium">{m.name}</span>
                      {m.dosage && <span className="text-muted-foreground">{m.dosage}</span>}
                      {m.frequency && <Badge variant="outline" className="text-xs px-1.5 py-0">{m.frequency}</Badge>}
                      {m.duration && <Badge variant="outline" className="text-xs px-1.5 py-0 flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{m.duration}</Badge>}
                      {m.route !== 'oral' && <Badge variant="secondary" className="text-xs px-1.5 py-0 capitalize">{m.route}</Badge>}
                    </div>
                    {m.instructions && <p className="text-xs text-muted-foreground mt-1">{m.instructions}</p>}
                  </div>
                  <button type="button" onClick={() => removeMedicine(i)} className="text-muted-foreground hover:text-destructive cursor-pointer p-1"><X className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lab Tests */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2"><Beaker className="h-4 w-4" />Lab Tests</CardTitle>
            {labTests.length > 0 && <Badge variant="outline">{labTests.length}</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div ref={labDropdownRef} className="relative">
            <div className="flex gap-2">
              <Input placeholder="Type or select a lab test..." value={labInput} onChange={(e) => { setLabInput(e.target.value); setShowLabDropdown(true); }} onFocus={() => setShowLabDropdown(true)} className="flex-1" />
              <Button type="button" variant="outline" size="sm" onClick={() => addLabTest()}><Plus className="h-4 w-4" /></Button>
            </div>
            {showLabDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-lg border bg-popover shadow-lg z-50">
                {COMMON_LAB_TESTS.filter(t => t.toLowerCase().includes(labInput.toLowerCase())).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => addLabTest(t)}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          {labTests.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {labTests.map((t, i) => (
                <Badge key={i} variant="outline" className="gap-1.5 px-2 py-1">{t.testName}<button type="button" onClick={() => removeLabTest(i)} className="cursor-pointer hover:text-destructive"><X className="h-3 w-3" /></button></Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes & Follow-up */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-2">
          <label className="text-sm font-medium">Clinical Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Additional clinical notes..." />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Follow-up Date</label>
          <Input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-2 border-t">
        <Button type="submit" disabled={isSubmitting || (diagnosis.length === 0 && medicines.length === 0 && labTests.length === 0)} size="lg">
          {isSubmitting ? 'Saving...' : 'Save Prescription'}
        </Button>
      </div>
    </form>
  );
}
