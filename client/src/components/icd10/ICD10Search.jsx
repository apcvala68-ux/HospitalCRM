import { useState, useEffect, useRef } from 'react';
import { Input } from '../ui/input';
import { Search, Loader2 } from 'lucide-react';

const ICD_API = 'https://icd10api.com/autocomplete';

export function ICD10Search({ onSelect, selected = [], placeholder = 'Search diagnosis (ICD-10)...' }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`${ICD_API}?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data?.slice?.(0, 10) || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isSelected = (code) => selected.some((d) => d.code === code);

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="pl-10"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border bg-popover shadow-lg">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelect({ code: r.icd10_code || r.code, description: r.icd10_desc || r.description || r.label });
                setQuery('');
                setOpen(false);
              }}
              disabled={isSelected(r.icd10_code || r.code)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span className="font-mono text-xs font-bold text-primary">
                {r.icd10_code || r.code}
              </span>
              <span className="flex-1 truncate">{r.icd10_desc || r.description || r.label}</span>
              {isSelected(r.icd10_code || r.code) && (
                <span className="text-xs text-muted-foreground">selected</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
