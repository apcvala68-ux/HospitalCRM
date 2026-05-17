import { useState } from 'react';
import { useEODReport } from '../../hooks/useBilling';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';

export function EODReportPage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const { data, isLoading } = useEODReport(date);

  const report = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">End of Day Report</h1>
          <p className="text-muted-foreground">Daily financial reconciliation</p>
        </div>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-48"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : report ? (
        <>
          <div className="grid gap-4 md:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Bills</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{report.summary?.totalBills}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Total Billed</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">₹{report.summary?.totalBilled?.toLocaleString()}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Revenue Collected</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-green-600">₹{report.summary?.totalRevenue?.toLocaleString()}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Paid Bills</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold">{report.summary?.paidBills}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">Pending Amount</CardTitle>
              </CardHeader>
              <CardContent><p className="text-2xl font-bold text-destructive">₹{report.summary?.pendingAmount?.toLocaleString()}</p></CardContent>
            </Card>
          </div>

          {report.paymentMethods && Object.keys(report.paymentMethods).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(report.paymentMethods).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="capitalize font-medium">{method}</span>
                      <div className="flex items-center gap-4">
                        <div className="h-2 w-48 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(amount / report.summary.totalRevenue) * 100}%` }}
                          />
                        </div>
                        <span className="font-mono text-sm">₹{amount?.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {report.bills?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">All Bills ({report.bills.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-2 font-medium">Invoice</th>
                        <th className="pb-2 font-medium">Patient</th>
                        <th className="pb-2 font-medium">Total</th>
                        <th className="pb-2 font-medium">Paid</th>
                        <th className="pb-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.bills.map((b) => (
                        <tr key={b._id} className="border-b last:border-0 text-sm">
                          <td className="py-2 font-mono">{b.invoiceNo}</td>
                          <td className="py-2">{b.patient?.firstName} {b.patient?.lastName}</td>
                          <td className="py-2">₹{b.total?.toLocaleString()}</td>
                          <td className="py-2">₹{b.amountPaid?.toLocaleString()}</td>
                          <td className="py-2 capitalize">{b.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : (
        <div className="py-12 text-center text-muted-foreground">No data for this date</div>
      )}
    </div>
  );
}
