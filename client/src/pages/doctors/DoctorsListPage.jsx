import { useDoctors } from '../../hooks/useDoctor';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Stethoscope, Phone, Mail, Building2, Award } from 'lucide-react';

export function DoctorsListPage() {
  const { data, isLoading } = useDoctors();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Doctors</h1>
        <p className="text-muted-foreground">Hospital medical staff directory</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.doctors?.map((doc) => (
            <Card key={doc._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Stethoscope className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{doc.user?.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{doc.specialization}</p>
                    </div>
                  </div>
                  <Badge variant={doc.isAvailable ? 'success' : 'secondary'}>
                    {doc.isAvailable ? 'Available' : 'Away'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {doc.department && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    {doc.department?.name}
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {doc.user?.phone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {doc.user?.email}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  {doc.qualifications?.join(', ') || '--'}
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License</span>
                    <span className="font-mono text-xs">{doc.licenseNo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee</span>
                    <span className="font-medium">₹{doc.consultationFee}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
