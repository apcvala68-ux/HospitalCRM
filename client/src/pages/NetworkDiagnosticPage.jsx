import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { AlertCircle, CheckCircle, Wifi, WifiOff, Loader2, Copy, RefreshCw } from 'lucide-react';

const RAILWAY_URL = 'https://hospitalcrm-production.up.railway.app';
const RAILWAY_IP = '66.33.22.121';
const DNS_SERVERS = [
  { name: 'Google DNS', ip: '8.8.8.8' },
  { name: 'Cloudflare DNS', ip: '1.1.1.1' },
  { name: 'OpenDNS', ip: '208.67.222.222' },
];

export function NetworkDiagnosticPage() {
  const [status, setStatus] = useState({
    dnsResolved: false,
    backendReachable: false,
    corsWorking: false,
    loading: false,
    error: null,
  });
  const [copied, setCopied] = useState(false);

  const dnsFixCommands = {
    linux: `sudo sh -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'`,
    windows: `netsh interface ip set dns "Wi-Fi" static 8.8.8.8`,
    mac: `sudo networksetup -setdnsservers Wi-Fi 8.8.8.8 1.1.1.1`,
  };

  const runDiagnostics = async () => {
    setStatus(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Test 1: DNS Resolution
      let dnsResolved = false;
      try {
        const response = await fetch(`${RAILWAY_URL}/api/health`, {
          method: 'GET',
          mode: 'cors',
          signal: AbortSignal.timeout(5000),
        });
        dnsResolved = response.ok;
      } catch (e) {
        dnsResolved = false;
      }

      // Test 2: Backend Reachability
      let backendReachable = false;
      try {
        const response = await fetch(`${RAILWAY_URL}/api/health`, {
          method: 'GET',
          mode: 'no-cors',
          signal: AbortSignal.timeout(5000),
        });
        backendReachable = true;
      } catch (e) {
        backendReachable = false;
      }

      // Test 3: CORS Check
      let corsWorking = false;
      try {
        const response = await fetch(`${RAILWAY_URL}/api/health`, {
          method: 'GET',
          mode: 'cors',
          signal: AbortSignal.timeout(5000),
        });
        corsWorking = response.ok && response.headers.get('access-control-allow-origin');
      } catch (e) {
        corsWorking = false;
      }

      setStatus({
        dnsResolved,
        backendReachable,
        corsWorking,
        loading: false,
        error: null,
      });
    } catch (err) {
      setStatus({
        dnsResolved: false,
        backendReachable: false,
        corsWorking: false,
        loading: false,
        error: err.message,
      });
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const copyCommand = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allPassed = status.dnsResolved && status.backendReachable && status.corsWorking;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Network Diagnostics</h1>
          <p className="text-sm text-muted-foreground">Check connectivity to Railway backend</p>
        </div>
        <Button onClick={runDiagnostics} disabled={status.loading}>
          {status.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {status.loading ? 'Testing...' : 'Run Tests'}
        </Button>
      </div>

      {/* Status Overview */}
      <Card className={allPassed ? 'border-green-500' : status.error ? 'border-red-500' : 'border-yellow-500'}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {allPassed ? (
              <CheckCircle className="h-6 w-6 text-green-500" />
            ) : (
              <AlertCircle className="h-6 w-6 text-red-500" />
            )}
            <div>
              <p className="font-semibold">
                {allPassed ? 'All Systems Operational' : 'Connection Issues Detected'}
              </p>
              <p className="text-sm text-muted-foreground">
                {allPassed
                  ? 'Backend is accessible and CORS is working correctly'
                  : 'Your network is blocking Railway domains. Follow the fix below.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wifi className="h-4 w-4" /> DNS Resolution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={status.dnsResolved ? 'success' : 'destructive'}>
              {status.dnsResolved ? 'Working' : 'Failed'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Can resolve hospitalcrm-production.up.railway.app
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wifi className="h-4 w-4" /> Backend Reachable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={status.backendReachable ? 'success' : 'destructive'}>
              {status.backendReachable ? 'Working' : 'Failed'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Railway server is responding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wifi className="h-4 w-4" /> CORS Headers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={status.corsWorking ? 'success' : 'destructive'}>
              {status.corsWorking ? 'Working' : 'Failed'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Cross-origin requests allowed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* DNS Fix Instructions */}
      {!allPassed && (
        <Card className="border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              DNS Fix Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Your network's DNS server is blocking Railway domains. Run this command in your terminal:
            </p>

            <div className="space-y-3">
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Linux (Kali/Ubuntu)</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCommand(dnsFixCommands.linux)}
                    className="h-6 px-2"
                  >
                    {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <code className="text-sm font-mono">{dnsFixCommands.linux}</code>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">Windows</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCommand(dnsFixCommands.windows)}
                    className="h-6 px-2"
                  >
                    {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <code className="text-sm font-mono">{dnsFixCommands.windows}</code>
              </div>

              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">macOS</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyCommand(dnsFixCommands.mac)}
                    className="h-6 px-2"
                  >
                    {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <code className="text-sm font-mono">{dnsFixCommands.mac}</code>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/30 p-4">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Alternative DNS Servers:
              </p>
              <div className="mt-2 space-y-1">
                {DNS_SERVERS.map(dns => (
                  <div key={dns.ip} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{dns.name}</span>
                    <code className="font-mono">{dns.ip}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={runDiagnostics} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Re-test Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Details */}
      {status.error && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-lg text-red-600">Error Details</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-sm font-mono text-red-600">{status.error}</code>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
