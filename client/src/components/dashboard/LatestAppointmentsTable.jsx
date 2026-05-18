import { Table, Chip } from '@heroui/react';
import { useLatestAppointments } from '../../hooks/useDashboard';

const statusColorMap = {
  scheduled: 'warning',
  confirmed: 'success',
  'checked-in': 'accent',
  completed: 'default',
  cancelled: 'danger',
  'no-show': 'danger',
};

export function LatestAppointmentsTable() {
  const { data, isLoading } = useLatestAppointments();
  const appointments = data?.appointments || [];
  const items = appointments.slice(0, 5);

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
        <Table.Content aria-label="Latest appointments">
          <Table.Header>
            <Table.Column id="patientId">PATIENT ID</Table.Column>
            <Table.Column id="patientName" isRowHeader>PATIENT NAME</Table.Column>
            <Table.Column id="sessionType">SESSION TYPE</Table.Column>
            <Table.Column id="doctorName">DOCTOR NAME</Table.Column>
            <Table.Column id="dateTime">DATE & TIME</Table.Column>
            <Table.Column id="status">STATUS</Table.Column>
          </Table.Header>
          <Table.Body
            items={items}
            renderEmptyState={() => (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-muted-foreground">No appointments yet</p>
              </div>
            )}
          >
            {(apt) => (
              <Table.Row id={apt._id}>
                <Table.Cell><span className="font-mono text-xs text-muted-foreground">{apt.patientId}</span></Table.Cell>
                <Table.Cell><span className="font-semibold text-sm text-foreground">{apt.patientName}</span></Table.Cell>
                <Table.Cell><span className="text-xs text-muted-foreground">{apt.sessionType}</span></Table.Cell>
                <Table.Cell><span className="text-xs text-muted-foreground">{apt.doctorName}</span></Table.Cell>
                <Table.Cell><span className="text-xs text-muted-foreground">{apt.dateTime}</span></Table.Cell>
                <Table.Cell>
                  <Chip color={statusColorMap[apt.status] || 'default'} variant="soft" size="sm">
                    {apt.status}
                  </Chip>
                </Table.Cell>
              </Table.Row>
            )}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
    </Table>
  );
}
