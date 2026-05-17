import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useBillingList } from '../../hooks/useBilling';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

const statusVariant = {
  pending: 'warning',
  partial: 'info',
  paid: 'success',
  cancelled: 'destructive',
  refunded: 'destructive',
};

export function BillingListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get('page')) || 1;
  const status = searchParams.get('status') || '';
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const { data, isLoading } = useBillingList({ page, status, search: searchInput, limit: 15 });

  const filterBy = (s) => {
    const p = new URLSearchParams();
    if (s) p.set('status', s);
    p.set('page', '1');
    setSearchParams(p);
  };

  const goToPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(p));
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set('search', searchInput);
    params.set('page', '1');
    setSearchParams(params);
  };

  const statLabels = { '': 'All', pending: 'Pending', partial: 'Partial', paid: 'Paid', cancelled: 'Cancelled' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Manage invoices and payments</p>
        </div>
        <Link to="/billing/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by invoice no..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">Search</Button>
      </form>

      <div className="flex gap-2">
        {Object.entries(statLabels).map(([key, label]) => (
          <Button
            key={key}
            variant={status === key ? 'default' : 'outline'}
            size="sm"
            onClick={() => filterBy(key)}
          >
            {label}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{data?.total || 0} Invoice{data?.total !== 1 ? 's' : ''}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : data?.bills?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No invoices found</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Invoice</th>
                      <th className="pb-3 font-medium">Patient</th>
                      <th className="pb-3 font-medium">Items</th>
                      <th className="pb-3 font-medium">Total</th>
                      <th className="pb-3 font-medium">Paid</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.bills?.map((b) => (
                      <tr key={b._id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="py-3 font-mono text-sm">{b.invoiceNo}</td>
                        <td className="py-3 text-sm font-medium">
                          {b.patient?.firstName} {b.patient?.lastName}
                        </td>
                        <td className="py-3 text-sm">{b.items?.length}</td>
                        <td className="py-3 text-sm font-medium">₹{b.total?.toLocaleString()}</td>
                        <td className="py-3 text-sm">₹{b.amountPaid?.toLocaleString()}</td>
                        <td className="py-3">
                          <Badge variant={statusVariant[b.status]}>{b.status}</Badge>
                        </td>
                        <td className="py-3 text-sm text-muted-foreground">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <Link to={`/billing/${b._id}`}>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data?.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">Page {data.page} of {data.totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={data.page <= 1} onClick={() => goToPage(data.page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={data.page >= data.totalPages} onClick={() => goToPage(data.page + 1)}>
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
