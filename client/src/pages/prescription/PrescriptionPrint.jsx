import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

function usePrescription(id) {
  return useQuery({
    queryKey: ['prescription', id],
    queryFn: () => api.get(`/prescriptions/${id}`),
    enabled: !!id,
  });
}

export function PrescriptionPrint() {
  const { id } = useParams();
  const { data } = usePrescription(id);
  const prescription = data?.prescription;

  useEffect(() => {
    if (prescription) window.print();
  }, [prescription]);

  if (!prescription) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="max-w-[800px] mx-auto p-8 print:p-0">
      <div className="border-b-2 border-primary pb-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-primary">Royale Hospital</h1>
            <p className="text-sm text-muted-foreground">Multispeciality Hospital & Research Centre</p>
            <p className="text-xs text-muted-foreground">Phone: +91-XXXX-XXXXXX | Email: info@royalehospital.com</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold">{prescription.doctor?.user?.name}</p>
            <p className="text-muted-foreground">{prescription.doctor?.specialization}</p>
            <p className="text-muted-foreground">Reg. No: {prescription.doctor?.licenseNo}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p><span className="font-medium">Patient:</span> {prescription.patient?.firstName} {prescription.patient?.lastName}</p>
          <p><span className="font-medium">UHID:</span> {prescription.patient?.uhid}</p>
          <p><span className="font-medium">Age/Sex:</span> {prescription.patient?.gender}</p>
        </div>
        <div className="text-right">
          <p><span className="font-medium">Date:</span> {new Date(prescription.createdAt).toLocaleDateString()}</p>
          <p><span className="font-medium">Rx No:</span> {prescription.prescriptionNo}</p>
        </div>
      </div>

      {prescription.diagnosis?.length > 0 && (
        <div className="mb-4">
          <p className="font-bold text-sm mb-1">Diagnosis:</p>
          <div className="flex flex-wrap gap-2">
            {prescription.diagnosis.map((d, i) => (
              <span key={i} className="text-sm border px-2 py-0.5 rounded">{d.code} — {d.description}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <p className="font-bold text-sm mb-3 border-b pb-1">Prescription (Rx)</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pb-2 w-8">#</th>
              <th className="pb-2">Medicine</th>
              <th className="pb-2">Dosage</th>
              <th className="pb-2">Frequency</th>
              <th className="pb-2">Duration</th>
              <th className="pb-2">Route</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medicines?.map((m, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-2">{i + 1}</td>
                <td className="py-2 font-medium">{m.name}</td>
                <td className="py-2">{m.dosage}</td>
                <td className="py-2">{m.frequency}</td>
                <td className="py-2">{m.duration}</td>
                <td className="py-2 capitalize">{m.route || 'oral'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {prescription.labTests?.length > 0 && (
        <div className="mb-6">
          <p className="font-bold text-sm mb-2 border-b pb-1">Lab Tests Advised</p>
          <div className="flex flex-wrap gap-2">
            {prescription.labTests.map((t, i) => (
              <span key={i} className="text-sm border px-2 py-0.5 rounded">{t.testName}</span>
            ))}
          </div>
        </div>
      )}

      {prescription.notes && (
        <div className="mb-6">
          <p className="font-bold text-sm mb-1">Notes:</p>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{prescription.notes}</p>
        </div>
      )}

      {prescription.followUpDate && (
        <div className="mb-6 p-3 border rounded">
          <p className="font-bold text-sm">Follow-up: {new Date(prescription.followUpDate).toLocaleDateString()}</p>
        </div>
      )}

      <div className="mt-12 pt-4 border-t flex justify-between text-sm">
        <div>
          <p className="text-muted-foreground">Pharmacist</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Doctor's Signature</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .max-w-\\[800px\\], .max-w-\\[800px\\] * { visibility: visible; }
          .max-w-\\[800px\\] { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
