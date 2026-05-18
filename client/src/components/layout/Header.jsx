import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Search, Moon, Sun, LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { Input } from '../ui/input';

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 lg:px-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
        <Input placeholder="Search patients, doctors..." className="h-10 pl-10 pr-4 text-sm rounded-lg bg-muted/30 border-muted/60 focus-visible:bg-card focus-visible:border-ring" />
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2.5 hover:bg-accent transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="h-4 w-4 text-muted-foreground/80" />
          ) : (
            <Moon className="h-4 w-4 text-muted-foreground/80" />
          )}
        </button>

        <button className="relative rounded-lg p-2.5 hover:bg-accent transition-colors cursor-pointer">
          <Bell className="h-4 w-4 text-muted-foreground/80" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
        </button>

        <div ref={menuRef} className="relative ml-3">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 rounded-lg pl-2.5 pr-3.5 py-1.5 hover:bg-accent transition-colors cursor-pointer"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary ring-1 ring-primary/20">
              {initials}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-semibold leading-tight text-foreground">{user?.name}</p>
              <p className="text-[11px] capitalize text-muted-foreground/70 leading-tight">{user?.role}</p>
            </div>
            <ChevronDown className="hidden md:block h-3.5 w-3.5 text-muted-foreground/50" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-lg border bg-popover shadow-lg z-50">
              <div className="p-3 border-b">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
                <p className="text-xs capitalize text-muted-foreground mt-0.5">{user?.role}</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => { navigate('/attendance'); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  My Attendance
                </button>
                <button
                  onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
              <div className="border-t p-1">
                <button
                  onClick={() => { logout(); navigate('/login'); setMenuOpen(false); }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
