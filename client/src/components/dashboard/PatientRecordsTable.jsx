import { useEffect } from 'react';
import { Table, Chip } from '@heroui/react';
import { usePatientRecords } from '../../hooks/useDashboard';
import { useToast } from '../../hooks/useToast';

const deptColorMap = {
  Cardiology: 'accent',
  Neurology: 'warning',
  Dermatology: 'danger',
  Orthopedics: 'warning',
  Urology: 'accent',
  Radiology: 'default',
  'ENT Surgery': 'warning',
  General: 'default',
};

export function PatientRecordsTable({ dateRange }) {
  const { data, isLoading, error } = usePatientRecords(dateRange);
  const toast = useToast();
  const records = data?.records || [];
  const items = records.slice(0, 8);

  useEffect(() => {
    if (error) toast.error(error.message || 'Failed to load');
  }, [error]);

  if (error) return <div className="text-destructive text-sm p-2">Failed to load</div>;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <Table variant="secondary">
      <Table.ScrollContainer>
        <Table.Content aria-label="Patient records">
          <Table.Header>
            <Table.Column id="patientName" isRowHeader>PATIENT NAME</Table.Column>
            <Table.Column id="diagnosis">DIAGNOSIS</Table.Column>
            <Table.Column id="department">DEPARTMENT</Table.Column>
            <Table.Column id="lastVisit">LAST VISIT</Table.Column>
          </Table.Header>
          <Table.Body
            items={items}
            renderEmptyState={() => (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No patient records yet</p>
              </div>
            )}
          >
            {(r) => (
              <Table.Row id={r._id}>
                <Table.Cell><span className="font-semibold text-sm text-foreground">{r.patientName}</span></Table.Cell>
                <Table.Cell><span className="text-xs text-muted-foreground">{r.diagnosis}</span></Table.Cell>
                <Table.Cell>
                  <Chip color={deptColorMap[r.department] || 'default'} variant="soft" size="sm">
                    {r.department}
                  </Chip>
                </Table.Cell>
                <Table.Cell><span className="text-xs text-muted-foreground">{r.lastVisit}</span></Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
