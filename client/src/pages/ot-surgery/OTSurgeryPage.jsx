import { useState, useCallback, useEffect } from 'react';
import { ConfirmDelete } from '../../components/ui/ConfirmDelete';
import { useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Search, Plus, ChevronLeft, ChevronRight,
  ArrowUpDown, ArrowUp, ArrowDown, Eye,
  Microscope, Clock, CheckCircle, AlertCircle,
  Pencil, Trash2, SlidersHorizontal, X,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const PAGE_SIZE_OPTIONS = [10, 15, 20, 50];
function SortIcon({ active, direction }) { if(!active) return <ArrowUpDown className="h-3 w-3 opacity-30 shrink-0" />; return direction==='asc' ? <ArrowUp className="h-3 w-3 shrink-0" /> : <ArrowDown className="h-3 w-3 shrink-0" />; }
function getPageNumbers(c,t){if(t<=7)return Array.from({length:t},(_,i)=>i+1);const p=[1];let s=Math.max(2,c-2),e=Math.min(t-1,c+2);if(c<=3)e=Math.min(5,t-1);if(c>=t-2)s=Math.max(t-4,2);if(s>2)p.push('...');for(let i=s;i<=e;i++)p.push(i);if(e<t-1)p.push('...');p.push(t);return p;}
function StatCard({ label, value, icon:Icon, color, bg, changeText, isIncrease }){return(<Card className="flex-1 min-w-[200px] shadow-[var(--shadow-kpi)] hover:shadow-[var(--shadow-elevated)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col rounded-2xl bg-card border border-border/50 overflow-hidden"><CardContent className="p-4 flex-1"><div className="flex justify-between items-start gap-2"><div className="flex flex-col"><span className="text-[11px] font-medium text-muted-foreground block">{label}</span><p className="mt-2 text-2xl font-bold text-foreground tracking-tight leading-none">{value}</p>{changeText&&<span className={cn("text-[10px] font-medium mt-2 block",isIncrease?'text-emerald-600 dark:text-emerald-400':'text-rose-500')}>{changeText}</span>}</div><div className={cn('rounded-xl p-2 shrink-0',bg)}><Icon className="h-5 w-5" style={{color}}/></div></div></CardContent></Card>);}

const statusVariant = { scheduled:'warning', 'in-progress':'info', completed:'success', cancelled:'destructive', postponed:'default' };

function useSurgeries(params={}){const qs=new URLSearchParams();Object.entries(params).forEach(([k,v])=>{if(v)qs.set(k,v);});return useQuery({queryKey:['ot-surgery',params],queryFn:()=>api.get(`/ot-surgery?${qs.toString()}`)});}
function useOTStats(){return useQuery({queryKey:['ot-stats'],queryFn:()=>api.get('/ot-surgery/stats')});}
function useDeleteSurgery(){const qc=useQueryClient();const t=useToast();return useMutation({mutationFn:(id)=>api.delete(`/ot-surgery/${id}`),onSuccess:()=>{t.success('Surgery deleted');qc.invalidateQueries({queryKey:['ot-surgery']});qc.invalidateQueries({queryKey:['ot-stats']});},onError:(e)=>t.error(e.message)});}

export function OTSurgeryPage(){
  const [sp,setSp]=useSearchParams();
  const page=Number(sp.get('page'))||1,limit=Number(sp.get('limit'))||15,search=sp.get('search')||'',sortBy=sp.get('sortBy')||'',sortOrder=sp.get('sortOrder')||'',statusFilter=sp.get('status')||'',dateFilter=sp.get('date')||'';
  const [si,setSi]=useState(search);const [fo,setFo]=useState(false);const [sf,setSf]=useState(false);
  const {data,isLoading}=useSurgeries({page,search,limit,sortBy,sortOrder,status:statusFilter,date:dateFilter});
  const {data:stats}=useOTStats();const del=useDeleteSurgery();const s=stats||{};
  const kpi=[
    {label:'Total Surgeries',value:(s.total||0).toLocaleString(),icon:Microscope,color:'#f43f5e',bg:'bg-rose-50 dark:bg-rose-950/30',changeText:'+12.3% from last month',isIncrease:true},
    {label:'Scheduled',value:s.scheduled||0,icon:Clock,color:'#f59e0b',bg:'bg-amber-50 dark:bg-amber-950/30',changeText:'pending',isIncrease:false},
    {label:"Today's Surgeries",value:s.todaySurgeries||0,icon:AlertCircle,color:'#3b82f6',bg:'bg-blue-50 dark:bg-blue-950/30',changeText:'today',isIncrease:true},
    {label:'Completed',value:s.completed||0,icon:CheckCircle,color:'#0d9488',bg:'bg-teal-50 dark:bg-teal-950/30',changeText:'+8 from last month',isIncrease:true},
  ];
  const up=useCallback((u)=>{setSp(p=>{const n=new URLSearchParams(p);Object.entries(u).forEach(([k,v])=>{if(v)n.set(k,v);else n.delete(k);});return n;});},[setSp]);
  const hs=(k)=>{if(sortBy===k)up({sortOrder:sortOrder==='asc'?'desc':'asc',page:'1'});else up({sortBy:k,sortOrder:'asc',page:'1'});};
  const cl=(n)=>{up({limit:String(n),page:'1'});};
  useEffect(()=>{const h=setTimeout(()=>{up({search:si,page:'1'});},350);return()=>clearTimeout(h);},[si,up]);
  const haf=!!(statusFilter||dateFilter||search);
  const hcf=()=>{setSi('');up({status:'',date:'',search:'',page:'1'});};
  const gp=(p)=>{if(p<1||p>(data?.totalPages||1))return;up({page:String(p)});};
  const items=data?.surgeries||[];const total=data?.total||0;const tp=data?.totalPages||1;const from=total===0?0:(page-1)*limit+1;const to=Math.min(page*limit,total);
  const [delTarget,setDelTarget]=useState(null);
  const hd=(id)=>setDelTarget(id);

  return(<div className="space-y-6">
    <div className="flex items-center justify-between">
      <div><h1 className="text-2xl font-bold tracking-tight text-foreground">OT & Surgery</h1><p className="text-sm text-muted-foreground mt-0.5">Manage surgical procedures and operating theatre schedules.</p></div>
      <Button onClick={()=>setSf(!sf)}><Plus className="mr-2 h-4 w-4" /> New Surgery</Button>
    </div>

    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">{kpi.map(c=><StatCard key={c.label} {...c}/>)}</div>

    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 w-full bg-card p-3 rounded-xl border border-border/50 shadow-sm">
        <form onSubmit={e=>e.preventDefault()} className="relative w-full md:w-80"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search by surgery no, procedure..." value={si} onChange={e=>setSi(e.target.value)} className="pl-10 pr-4 rounded-xl border-border/20 bg-muted/15 focus-visible:bg-background focus:ring-1 focus:ring-primary h-9 text-xs"/></form>
        <div className="flex items-center gap-2">
          {haf&&<button onClick={hcf} className="h-9 px-3.5 rounded-xl border border-red-200 dark:border-red-950/40 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer select-none shadow-sm"><X className="h-3.5 w-3.5" /> Clear Filters</button>}
          <button onClick={()=>setFo(!fo)} className={cn("h-9 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer select-none",fo?"bg-muted text-foreground border-zinc-300 dark:bg-[#18181b] dark:text-zinc-100 dark:border-zinc-700 shadow-md":"border-border/60 dark:border-border/20 bg-muted/30 hover:bg-muted/50 dark:bg-muted/10 dark:hover:bg-muted/20 text-muted-foreground hover:text-foreground")}><SlidersHorizontal className="h-3.5 w-3.5" /> Filter{(statusFilter||dateFilter)&&<span className="w-1.5 h-1.5 rounded-full bg-primary" />}</button>
        </div>
      </div>
      {fo&&<div className="p-4 bg-card rounded-xl border border-border/40 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
        <div><span className="text-[10px] font-bold text-muted-foreground block mb-2 uppercase tracking-wider">Status</span><div className="flex flex-wrap gap-2">{['','scheduled','in-progress','completed','cancelled','postponed'].map(s=><button key={s} onClick={()=>up({status:s,page:'1'})} className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer select-none",(statusFilter===s)?"bg-primary text-primary-foreground border-primary":"bg-muted/10 hover:bg-muted/20 border-border/10 text-muted-foreground hover:text-foreground")}>{s?s.charAt(0).toUpperCase()+s.slice(1).replace('-',' '):'All Status'}</button>)}</div></div>
        <div><span className="text-[10px] font-bold text-muted-foreground block mb-2 uppercase tracking-wider">Date</span><Input type="date" value={dateFilter} onChange={e=>up({date:e.target.value,page:'1'})} className="h-9 rounded-xl" /></div>
      </div>}
    </div>

    <Card><CardContent className="pt-6">
      {isLoading?(<div className="flex justify-center py-8"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>):items.length===0?(<div className="py-8 text-center text-muted-foreground">{search?'No surgeries match your search':'No surgeries scheduled yet'}</div>):(<>
        <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <th className="pb-3 pr-2 w-10 text-center font-semibold">#</th>
          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={()=>hs('surgeryNo')}><span className="inline-flex items-center gap-1">Surgery No <SortIcon active={sortBy==='surgeryNo'} direction={sortOrder} /></span></th>
          <th className="pb-3 font-semibold">Patient</th>
          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={()=>hs('procedure')}><span className="inline-flex items-center gap-1">Procedure <SortIcon active={sortBy==='procedure'} direction={sortOrder} /></span></th>
          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={()=>hs('otRoom')}><span className="inline-flex items-center gap-1">OT Room <SortIcon active={sortBy==='otRoom'} direction={sortOrder} /></span></th>
          <th className="pb-3 font-semibold">Surgeon</th>
          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={()=>hs('status')}><span className="inline-flex items-center gap-1">Status <SortIcon active={sortBy==='status'} direction={sortOrder} /></span></th>
          <th className="pb-3 font-semibold cursor-pointer select-none" onClick={()=>hs('scheduledDate')}><span className="inline-flex items-center gap-1">Date <SortIcon active={sortBy==='scheduledDate'} direction={sortOrder} /></span></th>
          <th className="pb-3 font-semibold w-32 text-right pr-4">Actions</th>
        </tr></thead><tbody>
          {items.map((r,idx)=><tr key={r._id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
            <td className="py-3.5 pr-2 text-center text-xs text-muted-foreground font-mono">{from+idx}</td>
            <td className="py-3.5 text-sm font-mono text-xs">{r.surgeryNo}</td>
            <td className="py-3.5 text-sm font-medium">{r.patient?.firstName?`${r.patient.firstName} ${r.patient.lastName}`:<span className="text-muted-foreground">—</span>}</td>
            <td className="py-3.5 text-sm">{r.procedure}</td>
            <td className="py-3.5 text-sm">{r.otRoom}</td>
            <td className="py-3.5 text-sm">{r.surgeon?.user?.name||<span className="text-muted-foreground">—</span>}</td>
            <td className="py-3.5"><Badge variant={statusVariant[r.status]||'default'}>{r.status?.replace('-',' ')}</Badge></td>
            <td className="py-3.5 text-xs text-muted-foreground whitespace-nowrap font-medium">{r.scheduledDate?new Date(r.scheduledDate).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—'}</td>
            <td className="py-3.5 text-right pr-4"><div className="flex items-center justify-end gap-2">
              <button className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer" title="View"><Eye className="h-[18px] w-[18px]" /></button>
              <button className="w-9 h-9 rounded-full border border-border dark:border-zinc-800/80 flex items-center justify-center bg-background dark:bg-[#18181b] hover:bg-muted dark:hover:bg-[#27272a] text-muted-foreground hover:text-foreground dark:text-zinc-400 dark:hover:text-zinc-100 shadow-sm transition-all duration-200 cursor-pointer" title="Edit"><Pencil className="h-4 w-4" /></button>
              <button onClick={()=>hd(r._id)} className="w-9 h-9 rounded-full border border-red-200 dark:border-red-950/60 flex items-center justify-center bg-red-50/50 hover:bg-red-100 dark:bg-[#2a1415] dark:hover:bg-[#3f1a1c] text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 shadow-sm transition-all duration-200 cursor-pointer" title="Delete"><Trash2 className="h-4 w-4" /></button>
            </div></td>
          </tr>)}
        </tbody></table></div>
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 border-t border-border/10 mt-2">
          <div className="flex flex-wrap items-center gap-4"><p className="text-xs text-muted-foreground font-semibold">Showing {from}–{to} of {total} surgeries</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 border-l border-border/20 pl-4"><label htmlFor="page-size" className="font-semibold">Rows per page:</label>
              <select id="page-size" value={limit} onChange={e=>cl(Number(e.target.value))} className="rounded-xl border border-border/20 bg-muted/15 hover:bg-muted/25 px-2.5 py-1 text-[11px] font-semibold transition-colors outline-none cursor-pointer">{PAGE_SIZE_OPTIONS.map(n=><option key={n} value={n} className="bg-background">{n}</option>)}</select></div></div>
          {tp>1&&<div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled={page<=1} onClick={()=>gp(page-1)} className="h-8 w-8 p-0"><ChevronLeft className="h-4 w-4" /></Button>
            {getPageNumbers(page,tp).map((p,i)=>p==='...'?<span key={`e-${i}`} className="px-1 text-muted-foreground font-semibold">…</span>:<Button key={p} variant={p===page?'default':'outline'} size="sm" onClick={()=>gp(p)} className="h-8 min-w-[2rem] px-2 font-semibold text-xs">{p}</Button>)}
            <Button variant="outline" size="sm" disabled={page>=tp} onClick={()=>gp(page+1)} className="h-8 w-8 p-0"><ChevronRight className="h-4 w-4" /></Button>
          </div>}
        </div>
      </>)}
    </CardContent></Card>
    <ConfirmDelete isOpen={delTarget!==null} onClose={()=>setDelTarget(null)} onConfirm={()=>{del.mutate(delTarget);setDelTarget(null);}} title="Delete Surgery" message="Delete this surgery record permanently?" />
  </div>);
}
