import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useUpdateProfile, useChangePassword } from '../../hooks/useSettings';
import {
  User, Lock, Shield, Calendar, Clock, Save, Loader2, CheckCircle, AlertCircle,
  Eye, EyeOff, Mail, Phone, Building2, LogOut,
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

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
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
      await updateProfile.mutateAsync({ name, phone });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    setErrors({});
    if (!currentPassword) {
      setErrors({ currentPassword: 'Current password is required' });
      return;
    }
    if (!newPassword) {
      setErrors({ newPassword: 'New password is required' });
      return;
    }
    if (newPassword.length < 6) {
      setErrors({ newPassword: 'Password must be at least 6 characters' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password' });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl">
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

        {/* TAB 1: Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" /> Profile Information
              </CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                {/* Avatar Preview */}
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <Badge className={`mt-1 ${roleColors[user.role] || ''}`}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                    />
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Your phone number"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                {profileMsg && (
                  <div className={`flex items-center gap-2 rounded-lg p-3 text-sm ${
                    profileMsg.type === 'success'
                      ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                      : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                  }`}>
                    {profileMsg.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
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

        {/* TAB 2: Password */}
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
                    <Input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                      {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <div className="relative">
                    <Input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                      {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
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

        {/* TAB 3: Account */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" /> Account Information
              </CardTitle>
              <CardDescription>Your account details and activity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Role & Status */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Shield className="h-4 w-4" /> Role
                  </div>
                  <Badge className={roleColors[user.role] || ''}>
                    {roleLabels[user.role] || user.role}
                  </Badge>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-4 w-4" /> Member Since
                  </div>
                  <p className="font-medium">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('en', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="h-4 w-4" /> Last Login
                  </div>
                  <p className="font-medium">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : 'First login'}
                  </p>
                </div>
              </div>

              {/* Account Details */}
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
                    <span className="text-sm text-muted-foreground">Account Status</span>
                    <Badge variant={user.isActive ? 'success' : 'destructive'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <span className="text-sm text-muted-foreground">Shift</span>
                    <span className="text-sm font-medium capitalize">{user.shift || 'General'}</span>
                  </div>
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-3">Connected Accounts</p>
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
                  <Badge variant={user.googleTokens?.accessToken ? 'success' : 'outline'}>
                    {user.googleTokens?.accessToken ? 'Linked' : 'Not Linked'}
                  </Badge>
                </div>
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
