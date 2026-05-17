import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePatients } from '../../hooks/usePatients';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Search, Plus, ChevronLeft, ChevronRight, User, Phone, Droplets } from 'lucide-react';

export function PatientListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(search);

  const { data, isLoading } = usePatients({ page, search, limit: 15 });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set('search', searchInput);
    params.set('page', '1');
    setSearchParams(params);
  };

  const goToPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patients</h1>
          <p className="text-muted-foreground">Manage patient records</p>
        </div>
        <Link to="/patients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Register Patient
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, UHID, phone..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {data?.total || 0} Patient{data?.total !== 1 ? 's' : ''}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : data?.patients?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {search ? 'No patients match your search' : 'No patients registered yet'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">UHID</th>
                      <th className="pb-3 font-medium">Name</th>
                      <th className="pb-3 font-medium">Phone</th>
                      <th className="pb-3 font-medium">Gender</th>
                      <th className="pb-3 font-medium">Blood Group</th>
                      <th className="pb-3 font-medium">Registered</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.patients?.map((p) => (
                      <tr key={p._id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 text-sm font-mono">{p.uhid}</td>
                        <td className="py-3">
                          <Link to={`/patients/${p._id}`} className="font-medium hover:text-primary">
                            {p.firstName} {p.lastName}
                          </Link>
                        </td>
                        <td className="py-3 text-sm">{p.phone}</td>
                        <td className="py-3 text-sm capitalize">{p.gender}</td>
                        <td className="py-3">
                          {p.bloodGroup ? (
                            <Badge variant="outline">{p.bloodGroup}</Badge>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <Link to={`/patients/${p._id}`}>
                            <Button variant="ghost" size="sm">View</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data?.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {data.page} of {data.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.page <= 1}
                      onClick={() => goToPage(data.page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.page >= data.totalPages}
                      onClick={() => goToPage(data.page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
