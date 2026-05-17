import { useState } from 'react';
import { useTodayAttendance, useAttendanceList, useCheckIn, useCheckOut, useMarkAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useToast } from '../../hooks/useToast';
import { Clock, LogIn, LogOut, Users, Calendar } from 'lucide-react';

export function AttendancePage() {
  const { user } = useAuth();
  const { data: todayData } = useTodayAttendance();
  const [viewDate, setViewDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: historyData } = useAttendanceList({ date: viewDate });
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();
  const markAttendance = useMarkAttendance();
  const toast = useToast();

  const records = todayData?.records || [];
  const history = historyData?.records || [];
  const myRecord = records.find(r => r.user?._id === user?._id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Attendance</h1>
          <p className="text-muted-foreground">Track check-in, check-out, and attendance history</p>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {todayData?.presentToday}/{todayData?.totalStaff} present today
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">My Attendance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {myRecord ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  {myRecord.checkOut ? 'Completed' : 'Checked In'}
                </p>
                <p className="text-xs text-muted-foreground">
                  In: {new Date(myRecord.checkIn).toLocaleTimeString()}
                  {myRecord.checkOut && ` | Out: ${new Date(myRecord.checkOut).toLocaleTimeString()}`}
                </p>
                <Badge className="mt-1 capitalize">{myRecord.shift} shift</Badge>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not checked in today</p>
            )}
            <div className="flex gap-2">
              {!myRecord && (
                <Button onClick={() => checkIn.mutate({})} disabled={checkIn.isPending} className="flex-1">
                  <LogIn className="mr-2 h-4 w-4" /> Check In
                </Button>
              )}
              {myRecord && !myRecord.checkOut && (
                <Button onClick={() => checkOut.mutate()} disabled={checkOut.isPending} variant="outline" className="flex-1">
                  <LogOut className="mr-2 h-4 w-4" /> Check Out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Today's Attendance ({records.length})</CardTitle></CardHeader>
          <CardContent>
            {records.length === 0 ? (
              <p className="text-sm text-muted-foreground">No one checked in yet</p>
            ) : (
              <div className="space-y-1 max-h-80 overflow-y-auto">
                {records.map((r) => (
                  <div key={r._id} className="flex items-center justify-between rounded-lg border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{r.user?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{r.user?.role} · {r.shift}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs">
                      <p>{new Date(r.checkIn).toLocaleTimeString()}</p>
                      {r.checkOut && <p className="text-muted-foreground">{new Date(r.checkOut).toLocaleTimeString()}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Attendance History</CardTitle>
              <Input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)} className="w-48" />
            </div>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">No records for this date</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-2 font-medium">Staff</th>
                      <th className="pb-2 font-medium">Role</th>
                      <th className="pb-2 font-medium">Shift</th>
                      <th className="pb-2 font-medium">In</th>
                      <th className="pb-2 font-medium">Out</th>
                      <th className="pb-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r) => (
                      <tr key={r._id} className="border-b last:border-0 text-sm">
                        <td className="py-2 font-medium">{r.user?.name}</td>
                        <td className="py-2 capitalize text-muted-foreground">{r.user?.role}</td>
                        <td className="py-2 capitalize">{r.shift}</td>
                        <td className="py-2">{r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : '--'}</td>
                        <td className="py-2">{r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : '--'}</td>
                        <td className="py-2">
                          <Badge variant={r.status === 'present' ? 'success' : r.status === 'absent' ? 'destructive' : 'warning'}>
                            {r.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
