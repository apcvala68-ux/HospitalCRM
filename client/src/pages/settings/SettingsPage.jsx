import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useUpdateProfile, useChangePassword, useConnectGoogle, useDisconnectGoogle } from '../../hooks/useSettings';
import { Switch } from '../../components/ui/switch';
import {
  User, Lock, Shield, Calendar, Clock, Save, Loader2, CheckCircle, AlertCircle,
  Eye, EyeOff, Mail, Phone, Building2, LogOut, Globe, MapPin, BookUser, VenusAndMars,
  Cake, UserRoundPen,
} from 'lucide-react';
import { displayPhone } from '../../lib/utils';

const roleLabels = {
  admin: 'Administrator',
  doctor: 'Doctor',
  nurse: 'Nurse',
  cashier: 'Cashier',
  receptionist: 'Receptionist',
  pharmacist: 'Pharmacist',
};

const roleColors = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  doctor: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  nurse: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  cashier: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  receptionist: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  pharmacist: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300',
};

export function SettingsPage() {
  const { user } = useAuth();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const connectGoogle = useConnectGoogle();
  const disconnectGoogle = useDisconnectGoogle();

  const [activeTab, setActiveTab] = useState('profile');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [shift, setShift] = useState('general');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [language, setLanguage] = useState('en');
  const [emailNotifications, setEmailNotifications] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [googleMsg, setGoogleMsg] = useState(null);
  const [errors, setErrors] = useState({});

  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setShift(user.shift || 'general');
      setGender(user.gender || '');
      setDateOfBirth(user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '');
      setAddress(user.address || '');
      setBio(user.bio || '');
      setLanguage(user.preferences?.language || 'en');
      setEmailNotifications(user.preferences?.emailNotifications ?? true);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg(null);
    setErrors({});
    if (!name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }
    try {
      await updateProfile.mutateAsync({
        name, phone, shift, gender,
        dateOfBirth: dateOfBirth || undefined,
        address, bio,
        preferences: { language, emailNotifications },
      });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    setErrors({});
    if (!currentPassword) { setErrors({ currentPassword: 'Current password is required' }); return; }
    if (!newPassword) { setErrors({ newPassword: 'New password is required' }); return; }
    if (newPassword.length < 6) { setErrors({ newPassword: 'Password must be at least 6 characters' }); return; }
    if (newPassword !== confirmPassword) { setErrors({ confirmPassword: 'Passwords do not match' }); return; }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password' });
    }
  };

  const handleConnectGoogle = async () => {
    setConnecting(true);
    setGoogleMsg(null);
    try {
      const resp = await fetch('/api/auth/google-auth-url');
      const { url } = await resp.json();
      const popup = window.open(url, 'google-auth', 'width=600,height=700');
      if (!popup) { setGoogleMsg({ type: 'error', text: 'Pop-up blocked. Allow pop-ups and try again.' }); setConnecting(false); return; }
      const timer = setInterval(() => {
        try {
          if (popup.closed) {
            clearInterval(timer);
            setConnecting(false);
            return;
          }
          if (popup.location.origin === window.location.origin) {
            const params = new URLSearchParams(popup.location.search);
            const code = params.get('code');
            if (code) {
              popup.close();
              clearInterval(timer);
              connectGoogle.mutate(code, {
                onSuccess: () => setGoogleMsg({ type: 'success', text: 'Google account connected' }),
                onError: (err) => setGoogleMsg({ type: 'error', text: err.message || 'Failed to connect Google' }),
                onSettled: () => setConnecting(false),
              });
            }
          }
        } catch { }
      }, 500);
    } catch (err) {
      setGoogleMsg({ type: 'error', text: 'Failed to initiate Google connection' });
      setConnecting(false);
    }
  };

  const handleDisconnectGoogle = () => {
    disconnectGoogle.mutate(undefined, {
      onSuccess: () => setGoogleMsg({ type: 'success', text: 'Google account disconnected' }),
      onError: (err) => setGoogleMsg({ type: 'error', text: err.message || 'Failed to disconnect' }),
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account settings and profile</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="password" className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Password
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Account
          </TabsTrigger>
        </TabsList>

        {/* ══════════════ TAB 1: Profile ══════════════ */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" /> Profile Information
              </CardTitle>
              <CardDescription className="text-foreground/80">Update your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shrink-0">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <Badge className={`mt-1 ${roleColors[user.role] || ''}`}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </div>
                </div>

                {/* Row 1: Name + Email */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input value={user.email} disabled className="pl-9" />
                    </div>
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>

                {/* Row 2: Phone + Gender */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Your phone number" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Gender</label>
                    <div className="relative">
                      <VenusAndMars className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <select value={gender} onChange={(e) => setGender(e.target.value)} className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none cursor-pointer">
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 3: DOB + Shift */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date of Birth</label>
                    <div className="relative">
                      <Cake className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Shift</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <select value={shift} onChange={(e) => setShift(e.target.value)} className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none cursor-pointer">
                        <option value="general">General</option>
                        <option value="morning">Morning</option>
                        <option value="evening">Evening</option>
                        <option value="night">Night</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 4: Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Your address" rows={2} className="flex w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm outline-none resize-none" />
                  </div>
                </div>

                {/* Row 5: Bio */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio / About Me</label>
                  <div className="relative">
                    <UserRoundPen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} className="flex w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm outline-none resize-none" />
                  </div>
                </div>

                {/* Section: Preferences */}
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold mb-3 flex items-center gap-2"><BookUser className="h-4 w-4" /> Preferences</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Language</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="flex h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none cursor-pointer">
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Notifications</label>
                      <div className="flex items-center gap-3 pt-1.5">
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                        <span className="text-sm text-muted-foreground">{emailNotifications ? 'Enabled' : 'Disabled'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile message */}
                {profileMsg && (
                  <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                    profileMsg.type === 'success'
                      ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                      : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {profileMsg.type === 'success' ? <CheckCircle className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                    {profileMsg.text}
                  </div>
                )}

                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
                  ) : (
                    <><Save className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Save Changes</span></>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════ TAB 2: Password ══════════════ */}
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" /> Change Password
              </CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <div className="relative">
                    <Input type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Input type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
                {passwordMsg && (
                  <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                    passwordMsg.type === 'success'
                      ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                      : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {passwordMsg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {passwordMsg.text}
                  </div>
                )}
                <Button type="submit" disabled={changePassword.isPending}>
                  {changePassword.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Changing...</>
                  ) : (
                    <><Lock className="h-4 w-4 mr-2" /> Change Password</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ══════════════ TAB 3: Account ══════════════ */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" /> Account Information
              </CardTitle>
              <CardDescription>Your account details and activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role & Status grid */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Shield className="h-4 w-4" /> Role
                  </div>
                  <Badge className={roleColors[user.role] || ''}>{roleLabels[user.role] || user.role}</Badge>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" /> Member Since
                  </div>
                  <p className="font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" /> Last Login
                  </div>
                  <p className="font-medium">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'First login'}
                  </p>
                </div>
              </div>

              {/* Account details list */}
              <div className="rounded-lg border">
                <div className="divide-y">
                  <div className="flex items-center justify-between p-3">
                    <span className="text-sm text-muted-foreground">Email</span>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="text-sm text-muted-foreground">Phone</span>
                    <span className="text-sm font-medium">{displayPhone(user.phone)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="text-sm text-muted-foreground">Shift</span>
                    <span className="text-sm font-medium capitalize">{user.shift || 'General'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="text-sm text-muted-foreground">Account Status</span>
                    <Badge variant={user.isActive ? 'success' : 'destructive'}>{user.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="rounded-lg border p-4 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2"><Mail className="h-4 w-4" /> Connected Accounts</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                      <span className="text-sm font-bold text-red-600">G</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Google</p>
                      <p className="text-xs text-muted-foreground">
                        {user.googleTokens?.accessToken ? 'Connected' : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {user.googleTokens?.accessToken ? (
                    <Button variant="destructive" size="sm" onClick={handleDisconnectGoogle} disabled={disconnectGoogle.isPending}>
                      {disconnectGoogle.isPending ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleConnectGoogle} disabled={connecting}>
                      {connecting ? 'Connecting...' : 'Connect'}
                    </Button>
                  )}
                </div>
                {googleMsg && (
                  <div className={`flex items-center gap-2 rounded-lg p-2.5 text-xs ${
                    googleMsg.type === 'success'
                      ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                      : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {googleMsg.type === 'success' ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="h-3.5 w-3.5 shrink-0" />}
                    {googleMsg.text}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200 dark:border-red-900 mt-4">
            <CardHeader>
              <CardTitle className="text-lg text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Logout</p>
                  <p className="text-xs text-muted-foreground">Sign out of your account</p>
                </div>
                <Button variant="destructive" onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}>
                  <LogOut className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
