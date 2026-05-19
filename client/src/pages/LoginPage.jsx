import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogin, useGoogleLogin } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Building2, Eye, EyeOff, Activity, Users, BarChart3, Shield } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const toast = useToast();

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({ email, password });
      toast.success('Login successful');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/google/callback')}&response_type=code&scope=email profile`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-4xl bg-card rounded-2xl shadow-xl overflow-hidden flex">
        {/* Left Panel - Form */}
        <div className="flex-1 p-8 md:p-12">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">Royale Hospital</span>
            </div>
            <h1 className="text-2xl font-bold mb-1">Get Started Now</h1>
            <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full mb-4 h-11"
            onClick={handleGoogleLogin}
            disabled={googleLoginMutation.isPending}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Log in with Google
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email address</label>
              <Input
                type="email"
                placeholder="you@hospital.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot password?</button>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="min 8 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? 'Signing in...' : 'Login'}
            </Button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Demo accounts:</strong><br />
              admin@hospital.com / Admin@123<br />
              sharma@hospital.com / Doctor@123<br />
              tina@hospital.com / Staff@123
            </p>
          </div>
        </div>

        {/* Right Panel - Branding */}
        <div className="hidden md:flex flex-1 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-12 flex-col justify-between relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-white blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">The simplest way to manage<br />your hospital</h2>
            <p className="text-sm text-primary-foreground/80">Enter your credentials to access your account</p>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="relative z-10 bg-white/10 backdrop-blur rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium">Dashboard</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-primary-foreground/70">Patients Today</p>
                <p className="text-xl font-bold">124</p>
                <p className="text-xs text-green-300">+12% today</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-primary-foreground/70">Appointments</p>
                <p className="text-xl font-bold">8.5 hr</p>
                <p className="text-xs text-primary-foreground/70">avg. wait time</p>
              </div>
            </div>
            <div className="bg-white/10 rounded-lg p-3">
              <p className="text-xs text-primary-foreground/70 mb-2">Department Overview</p>
              <div className="space-y-2">
                {['General Medicine', 'Cardiology', 'Orthopedics'].map((dept, i) => (
                  <div key={dept} className="flex items-center justify-between text-xs">
                    <span>{dept}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white/60 rounded-full" style={{ width: `${70 - i * 15}%` }} />
                      </div>
                      <span className="w-8 text-right">{85 - i * 15}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature Icons */}
          <div className="relative z-10 flex items-center gap-6 text-primary-foreground/60">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="text-xs">Patient Care</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-xs">Secure</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
