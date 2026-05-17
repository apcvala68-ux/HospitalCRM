import { useState } from 'react';
import { useDepartments } from '../../hooks/useDepartments';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Building2, Stethoscope, MapPin, Users } from 'lucide-react';

export function DepartmentsPage() {
  const [selectedDept, setSelectedDept] = useState(null);
  const { data, isLoading } = useDepartments();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Departments</h1>
        <p className="text-muted-foreground">Hospital departments and specialties</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data?.departments?.map((dept) => (
            <Card
              key={dept._id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedDept === dept._id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedDept(selectedDept === dept._id ? null : dept._id)}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                    {dept.location && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {dept.location}
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {dept.description && (
                  <p className="text-sm text-muted-foreground">{dept.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{dept.doctorCount || 0} doctors</span>
                </div>
                {dept.headDoctor && (
                  <div className="flex items-center gap-2 text-sm">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span>Head: {dept.headDoctor?.user?.name}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
