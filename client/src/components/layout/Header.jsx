import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Search, Moon, Sun, LogOut, User, Settings, ChevronDown, Plus, X } from 'lucide-react';
import { Input } from '../ui/input';
import { usePatientSearch } from '../../hooks/usePatients';

export function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Search patients query hook
  const { data: searchResultsData, isLoading: isSearching } = usePatientSearch(searchQuery);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search input on Ctrl+K or Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key?.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setShowDropdown(true);
      }
      // Close dropdown on Escape key
      if (e.key === 'Escape') {
        setShowDropdown(false);
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initials = user?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const patientsList = searchResultsData?.patients || [];

  return (
    <header className="relative z-30 flex h-14 items-center justify-between gap-4 border-b border-border/50 bg-card/90 backdrop-blur-sm px-4 lg:px-6">
      <div ref={searchContainerRef} className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input 
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search patients, doctors..." 
          className="pl-10 pr-12 rounded-xl border-border/20 bg-muted/15 focus-visible:bg-background focus:ring-1 focus:ring-primary h-9 text-xs placeholder:text-muted-foreground/60" 
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setShowDropdown(false);
              searchInputRef.current?.focus();
            }}
            className="absolute right-9 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground/60 hover:text-foreground cursor-pointer"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-0.5 rounded border border-border/80 bg-muted/50 dark:bg-zinc-900 px-1.5 font-mono text-[9px] font-medium text-muted-foreground/80 shadow-sm">
          <span className="text-[10px]">⌘</span>K
        </kbd>

        {/* Floating Search Results Dropdown */}
        {showDropdown && searchQuery.length >= 2 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-border bg-popover p-1.5 shadow-lg z-50 flex flex-col gap-0.5 animate-in fade-in-50 slide-in-from-top-1 duration-150">
            {isSearching ? (
              <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Searching...
              </div>
            ) : patientsList.length > 0 ? (
              <>
                <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">
                  Patients ({patientsList.length})
                </div>
                {patientsList.map((patient) => (
                  <button
                    key={patient._id}
                    onClick={() => {
                      navigate(`/patients/${patient._id}`);
                      setShowDropdown(false);
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between w-full rounded-lg px-2.5 py-2 text-left text-xs hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-foreground">{patient.firstName} {patient.lastName}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {patient.gender} • {patient.age} yrs • {patient.phone}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground bg-muted/40 dark:bg-zinc-900 px-2 py-0.5 rounded border border-border/60 dark:border-zinc-800/80">
                      {patient.uhid}
                    </span>
                  </button>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-muted-foreground">
                <Search className="h-5 w-5 mb-1.5 text-muted-foreground/40" />
                No matching patients found
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button 
          onClick={() => navigate('/appointments')}
          className="hidden sm:flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white dark:text-white px-3.5 py-2 text-sm font-semibold transition-all mr-2 shadow-sm hover:shadow active:scale-95 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Appointment
        </button>
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
