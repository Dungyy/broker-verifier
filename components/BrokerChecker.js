'use client'
import { useState, useRef } from 'react'
import {
  Search, ShieldCheck, ShieldX, ShieldAlert, RotateCcw,
  CheckCircle2, XCircle, AlertTriangle, AlertCircle,
  ChevronDown, ChevronUp, ExternalLink, Hash,
  Building2, Clock, MapPin, Truck, Phone, FileCheck,
} from 'lucide-react'

// ─────────────────────────────────────────────
// <BrokerChecker />
//
// Props:
//   compact    {bool}   smaller UI, no expand panel
//   onResult   {fn}     called with result object on success
//   className  {string} extra wrapper classes
// ─────────────────────────────────────────────

export default function BrokerChecker({ compact = false, onResult, className = '' }) {
  const [mc,       setMc]       = useState('')
  const [result,   setResult]   = useState(null)
  const [error,    setError]    = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef(null)

  const sanitize = (v) => v.replace(/^(MC|mc)[-\s]?/i, '').replace(/\D/g, '').slice(0, 7)

  const handleChange = (e) => {
    setMc(sanitize(e.target.value))
    if (error) setError(null)
    if (result) { setResult(null); setExpanded(false) }
  }

  const handlePaste = (e) => {
    setMc(sanitize(e.clipboardData.getData('text')))
    e.preventDefault()
  }

  const handleKeyDown = (e) => { if (e.key === 'Enter') verify() }

  const verify = async () => {
    if (!mc || mc.length < 4) { setError('Enter at least 4 digits.'); return }
    setLoading(true); setError(null); setResult(null); setExpanded(false)
    try {
      const res  = await fetch(`/api/broker-check?mc=${mc}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.') }
      else         { setResult(data); onResult?.(data) }
    } catch {
      setError('Network error. Check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setMc(''); setResult(null); setError(null); setExpanded(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  return (
    <div className={`w-full ${className}`}>

      {/* ── Input row ── */}
      <div className="flex gap-2">
        <div className="relative flex-1 min-w-0">
          <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-steel-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={mc}
            onChange={handleChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            placeholder="MC number (digits only)"
            maxLength={7}
            className={`
              w-full bg-steel-900 border rounded-lg pl-9 pr-4 py-3
              font-mono text-sm text-white placeholder-steel-600
              transition-colors
              ${error
                ? 'border-red-700 focus:border-red-500'
                : 'border-steel-700 hover:border-steel-500 focus:border-brand-500'
              }
            `}
          />
        </div>

        <button
          onClick={verify}
          disabled={loading || !mc}
          className="
            flex items-center gap-2 px-5 py-3 rounded-lg
            bg-brand-600 hover:bg-brand-500
            disabled:bg-steel-800 disabled:text-steel-600 disabled:cursor-not-allowed
            text-white font-body font-600 text-sm
            transition-colors whitespace-nowrap
          "
        >
          {loading
            ? <span className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full spin" />
            : <Search size={14} />
          }
          {loading ? 'Checking…' : 'Verify'}
        </button>

        {result && (
          <button
            onClick={reset}
            title="New search"
            className="px-3 py-3 rounded-lg border border-steel-700 hover:border-steel-500 text-steel-400 hover:text-white transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        )}
      </div>

      {/* ── Error state ── */}
      {error && (
        <div className="mt-3 flex items-start gap-2.5 bg-red-950/50 border border-red-800/50 rounded-lg px-4 py-3 fade-up">
          <AlertCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
          <p className="font-body text-sm text-red-300 leading-snug">{error}</p>
        </div>
      )}

      {/* ── Result ── */}
      {result && !error && (
        <ResultCard
          result={result}
          compact={compact}
          expanded={expanded}
          onToggle={() => setExpanded(v => !v)}
        />
      )}

      {/* ── Empty hint ── */}
      {!result && !error && !loading && (
        <p className="mt-2.5 font-mono text-[11px] text-steel-600 leading-relaxed">
          Strips "MC-" prefix automatically. Pulls live FMCSA data.{' '}
          <a
            href="https://safer.fmcsa.dot.gov/CompanySnapshot.aspx"
            target="_blank" rel="noopener noreferrer"
            className="text-brand-500 hover:text-brand-400 underline underline-offset-2"
          >
            Manual lookup →
          </a>
        </p>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Result Card
// ─────────────────────────────────────────────
const VERDICT_CONFIG = {
  APPROVED: {
    Icon: ShieldCheck,
    label: 'Approved',
    sub: 'Active authority · Insurance on file · Clean record',
    ring: 'ring-green-800/60',
    headerBg: 'bg-green-950/40',
    iconCls: 'text-green-400 bg-green-950 border-green-800',
    labelCls: 'text-green-300',
    badgeCls: 'bg-green-900/40 text-green-300 border-green-800',
  },
  CAUTION: {
    Icon: ShieldAlert,
    label: 'Caution',
    sub: 'Active but has flags — review the details below',
    ring: 'ring-yellow-800/60',
    headerBg: 'bg-yellow-950/40',
    iconCls: 'text-yellow-400 bg-yellow-950 border-yellow-800',
    labelCls: 'text-yellow-300',
    badgeCls: 'bg-yellow-900/40 text-yellow-300 border-yellow-800',
  },
  REJECT: {
    Icon: ShieldX,
    label: 'Do Not Use',
    sub: 'Inactive authority or missing insurance — decline this load',
    ring: 'ring-red-800/60',
    headerBg: 'bg-red-950/40',
    iconCls: 'text-red-400 bg-red-950 border-red-800',
    labelCls: 'text-red-300',
    badgeCls: 'bg-red-900/40 text-red-300 border-red-800',
  },
}

function ResultCard({ result, compact, expanded, onToggle }) {
  const vc = VERDICT_CONFIG[result.verdict]
  const { Icon } = vc

  return (
    <div className={`mt-4 rounded-xl ring-1 ${vc.ring} bg-steel-900 overflow-hidden fade-up`}>
      {/* Header */}
      <div className={`px-5 pt-5 pb-4 ${vc.headerBg}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-lg border flex items-center justify-center flex-shrink-0 ${vc.iconCls}`}>
              <Icon size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-display font-700 uppercase text-xl tracking-wide ${vc.labelCls}`}>
                  {vc.label}
                </span>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded border tracking-widest uppercase ${vc.badgeCls}`}>
                  MC {result.mc}
                </span>
                {result.authority.isBroker && (
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded border bg-steel-800 text-steel-400 border-steel-700 tracking-widest uppercase">
                    Broker
                  </span>
                )}
              </div>
              <p className="font-body text-xs text-steel-400 mt-0.5">{vc.sub}</p>
            </div>
          </div>
          <a
            href={`https://safer.fmcsa.dot.gov/CompanySnapshot.aspx`}
            target="_blank" rel="noopener noreferrer"
            className="text-steel-600 hover:text-brand-400 transition-colors mt-0.5"
            title="Open in FMCSA SAFER"
          >
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Identity grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
          <MiniCard icon={Building2} label="Legal Name"   value={result.legalName} small />
          <MiniCard icon={Clock}     label="Years Active" value={result.yearsActive != null ? `${result.yearsActive} yrs` : '—'} />
          <MiniCard icon={MapPin}    label="Location"     value={result.address || '—'} small />
          <MiniCard icon={Truck}     label="DOT #"        value={result.dotNumber ? `#${result.dotNumber}` : '—'} />
        </div>
      </div>

      {/* Key check rows */}
      <div className="px-5 py-4 grid sm:grid-cols-2 gap-2 border-t border-steel-800/60">
        <CheckRow label="Broker Authority"    value={result.authority.broker}   raw={result.authority.brokerRaw} />
        <CheckRow label="Common Authority"    value={result.authority.common}   raw={result.authority.commonRaw}   neutral />
        <CheckRow label="BIPD Insurance"      value={result.insurance.bipdOnFile  ? 'On File' : 'Not on File'} raw={result.insurance.bipdOnFile  ? 'A' : 'N'} />
        <CheckRow label="Cargo Insurance"     value={result.insurance.cargoOnFile ? 'On File' : 'Not on File'} raw={result.insurance.cargoOnFile ? 'A' : null} neutral />
        <CheckRow label="Safety Rating"       value={result.safety.rating || 'Unrated'} raw={safetyRaw(result.safety.score)} />
        <CheckRow label="Fatal Crashes (24mo)" value={String(result.crashes.fatal)} raw={fatalRaw(result.crashes.fatal)} />
      </div>

      {/* Expand toggle — hidden in compact mode */}
      {!compact && (
        <>
          <button
            onClick={onToggle}
            className="w-full flex items-center justify-between px-5 py-3 border-t border-steel-800/60 text-steel-500 hover:text-steel-200 hover:bg-steel-800/30 transition-colors"
          >
            <span className="font-mono text-[11px] tracking-widest uppercase">
              {expanded ? 'Hide' : 'View'} Full Report
            </span>
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {expanded && <FullReport result={result} />}
        </>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// Full Report (expanded panel)
// ─────────────────────────────────────────────
function FullReport({ result }) {
  return (
    <div className="border-t border-steel-800/60 px-5 py-6 space-y-7 fade-up">

      <ReportSection title="Authority">
        <Row k="Broker Authority"   v={result.authority.broker} />
        <Row k="Common Authority"   v={result.authority.common} />
        <Row k="Contract Authority" v={result.authority.contract} />
        <Row k="Entity Type"        v={result.entityType || '—'} />
        <Row k="Active Since"       v={result.mcsDate    || '—'} />
        <Row k="DBA Name"           v={result.dbaName    || '—'} />
        {result.phone && <Row k="Phone" v={result.phone} />}
      </ReportSection>

      <ReportSection title="Insurance & Bond">
        <Row k="BIPD Insurance on File"  v={result.insurance.bipdOnFile  ? 'Yes' : 'No'} warn={!result.insurance.bipdOnFile} />
        <Row k="Cargo Insurance on File" v={result.insurance.cargoOnFile ? 'Yes' : 'No'} />
        <Row k="Required Bond Amount"    v={result.insurance.bondAmount ? `$${Number(result.insurance.bondAmount).toLocaleString()}` : '—'} />
      </ReportSection>

      <ReportSection title="Safety Ratings">
        <Row k="FMCSA Safety Rating"  v={result.safety.rating || 'Unrated'} />
        <Row k="Vehicle OOS Rate"     v={`${result.safety.oosVehicle}%`}  warn={result.safety.oosVehicle > 30} />
        <Row k="Driver OOS Rate"      v={`${result.safety.oosDriver}%`}   warn={result.safety.oosDriver  > 20} />
        <Row k="Hazmat OOS Rate"      v={`${result.safety.oosHazmat}%`} />
      </ReportSection>

      <ReportSection title="Crash History (24 months)">
        <Row k="Total Crashes"  v={String(result.crashes.total)} />
        <Row k="Fatal Crashes"  v={String(result.crashes.fatal)}  warn={result.crashes.fatal  > 0} />
        <Row k="Injury Crashes" v={String(result.crashes.injury)} warn={result.crashes.injury > 2} />
      </ReportSection>

      {/* OOS thresholds reference */}
      <div className="bg-steel-800/30 rounded-lg px-4 py-3">
        <p className="font-mono text-[11px] text-steel-500 leading-relaxed">
          Industry thresholds: Vehicle OOS &gt; 30% = flag · Driver OOS &gt; 20% = flag · Any fatal crash = caution
        </p>
      </div>

      {/* External links */}
      <div className="flex flex-wrap gap-2 pt-1">
        <ExtLink href="https://safer.fmcsa.dot.gov/CompanySnapshot.aspx" label="FMCSA SAFER" />
        <ExtLink href="https://www.carrier411.com" label="Carrier411 Payment History" />
        <ExtLink href="https://www.rmissafety.com" label="RMIS Insurance Verify" />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────
function MiniCard({ icon: Icon, label, value, small }) {
  return (
    <div className="bg-steel-800/50 rounded-lg px-3 py-2.5">
      <div className="flex items-center gap-1 mb-1">
        <Icon size={10} className="text-steel-500" />
        <span className="font-mono text-[10px] text-steel-500 uppercase tracking-widest leading-none">{label}</span>
      </div>
      <span className={`font-body text-white leading-tight block truncate ${small ? 'text-xs' : 'text-sm font-500'}`}>
        {value}
      </span>
    </div>
  )
}

function CheckRow({ label, value, raw, neutral }) {
  // raw: 'A' = pass, 'N' = neutral/none, anything else = fail/warn
  let Icon, cls
  if (raw === 'A' || raw === 'good') {
    Icon = CheckCircle2; cls = 'text-green-400'
  } else if (raw === null || raw === 'N' || neutral) {
    Icon = AlertCircle;  cls = 'text-steel-500'
  } else if (raw === 'caution') {
    Icon = AlertTriangle; cls = 'text-yellow-400'
  } else {
    Icon = XCircle;      cls = 'text-red-400'
  }
  return (
    <div className="flex items-center justify-between gap-3 bg-steel-800/40 rounded-lg px-3 py-2.5">
      <span className="font-body text-xs text-steel-400 truncate">{label}</span>
      <div className={`flex items-center gap-1.5 font-mono text-xs font-500 flex-shrink-0 ${cls}`}>
        <Icon size={13} />
        {value}
      </div>
    </div>
  )
}

function ReportSection({ title, children }) {
  return (
    <div>
      <div className="font-mono text-[11px] text-brand-400 tracking-widest uppercase mb-3 flex items-center gap-2">
        <div className="h-px w-4 bg-brand-700" />
        {title}
      </div>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ k, v, warn }) {
  return (
    <div className="flex items-center justify-between gap-4 px-1">
      <span className="font-body text-sm text-steel-500">{k}</span>
      <span className={`font-mono text-xs font-500 text-right ${warn ? 'text-yellow-400' : 'text-steel-200'}`}>{v}</span>
    </div>
  )
}

function ExtLink({ href, label }) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-1.5 font-mono text-xs text-brand-400 hover:text-brand-300 border border-brand-900 hover:border-brand-700 px-3 py-2 rounded-lg transition-colors"
    >
      <ExternalLink size={10} />
      {label}
    </a>
  )
}

// helpers for CheckRow raw values
function safetyRaw(score) {
  if (score === 'good')    return 'A'
  if (score === 'caution') return 'caution'
  if (score === 'bad')     return 'bad'
  return null
}
function fatalRaw(n) {
  if (n === 0)  return 'A'
  if (n <= 2)   return 'caution'
  return 'bad'
}
