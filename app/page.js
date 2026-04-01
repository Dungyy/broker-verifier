import BrokerChecker from '@/components/BrokerChecker'
import {
  ShieldCheck, ShieldAlert, ShieldX,
  Truck, Info, ExternalLink,
} from 'lucide-react'

export const metadata = {
  title: 'Broker Checker — Muñoz Trucking',
  description: 'Verify any freight broker MC number against the live FMCSA database instantly.',
  robots: { index: false },
}

const RED_FLAGS = [
  'Refuses to give their MC number',
  'Pressures you to decide immediately',
  'Rate is suspiciously above market',
  'MC number is less than 6 months old',
  'No rate confirmation before pickup',
  'Asks you to use an unfamiliar app',
]

const VERDICT_GUIDE = [
  {
    Icon: ShieldCheck,
    color: 'text-green-400',
    bg: 'bg-green-950/30 border-green-900/50',
    label: 'Approved',
    desc: 'Active authority, insurance on file, clean safety record. Safe to work with — always negotiate your rate.',
  },
  {
    Icon: ShieldAlert,
    color: 'text-yellow-400',
    bg: 'bg-yellow-950/30 border-yellow-900/50',
    label: 'Caution',
    desc: 'Active authority but has red flags — conditional safety, high OOS rates, or recent fatal crashes. Proceed carefully.',
  },
  {
    Icon: ShieldX,
    color: 'text-red-400',
    bg: 'bg-red-950/30 border-red-900/50',
    label: 'Reject',
    desc: 'Inactive authority or missing insurance. Do not haul — you risk non-payment or no coverage on a claim.',
  },
]

export default function Home() {
  return (
    <div className="relative min-h-screen bg-steel-950">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-5%,rgba(37,99,235,0.18),transparent)] pointer-events-none" />

      {/* Top bar */}
      <header className="relative border-b border-steel-800/60 bg-steel-950/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded flex items-center justify-center">
              <Truck size={15} className="text-white" />
            </div>
            <div>
              <div className="font-display font-700 uppercase text-sm text-white tracking-wide leading-none">
                BROKER CHECKER
              </div>
              <div className="font-mono text-[10px] text-brand-400 tracking-widest">Muñoz Trucking LLC</div>
            </div>
          </div>
          <a
            href="https://safer.fmcsa.dot.gov/CompanySnapshot.aspx"
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-mono text-[11px] text-steel-500 hover:text-brand-400 transition-colors"
          >
            <ExternalLink size={11} />
            FMCSA SAFER
          </a>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_340px] gap-10 items-start">

          {/* ── LEFT: main tool ── */}
          <div>
            {/* Heading */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px w-8 bg-brand-500" />
                <span className="font-mono text-[11px] text-brand-400 tracking-[0.2em] uppercase">
                  FMCSA Live Lookup
                </span>
              </div>
              <h1 className="font-display font-800 uppercase leading-none tracking-tight text-white mb-3"
                  style={{ fontSize: 'clamp(42px, 6vw, 72px)' }}>
                Broker<br />Verifier
              </h1>
              <p className="font-body text-steel-400 text-base leading-relaxed max-w-lg">
                Enter any broker's MC number to instantly check their authority status,
                insurance, safety record, and crash history — straight from the FMCSA database.
              </p>
            </div>

            {/* Tool card */}
            <div className="bg-steel-900 border border-steel-800 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <span className="font-mono text-[11px] text-brand-400 tracking-widest uppercase">
                  Enter MC Number
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-dot" />
                  Live FMCSA Data
                </span>
              </div>
              <BrokerChecker />
            </div>

            {/* Setup note */}
            {/* <div className="flex items-start gap-3 bg-brand-950/30 border border-brand-900/40 rounded-xl p-4">
              <Info size={14} className="text-brand-400 mt-0.5 flex-shrink-0" />
              <p className="font-body text-xs text-steel-400 leading-relaxed">
                <span className="text-brand-300 font-500">Free API key required.</span>
                {' '}Get yours in 2 minutes at{' '}
                <a
                  href="https://mobile.fmcsa.dot.gov/developer/home.page"
                  target="_blank" rel="noopener noreferrer"
                  className="text-brand-400 underline underline-offset-2 hover:text-brand-300"
                >
                  mobile.fmcsa.dot.gov
                </a>
                {' '}then add{' '}
                <code className="font-mono text-[11px] bg-steel-800 px-1.5 py-0.5 rounded text-steel-300">
                  FMCSA_API_KEY=your_key
                </code>
                {' '}to{' '}
                <code className="font-mono text-[11px] bg-steel-800 px-1.5 py-0.5 rounded text-steel-300">
                  .env.local
                </code>.
                Without a key, demo data is shown.
              </p>
            </div> */}
          </div>

          {/* ── RIGHT: reference panels ── */}
          <div className="space-y-5">

            {/* Verdict guide */}
            <div className="bg-steel-900 border border-steel-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-steel-800">
                <span className="font-mono text-[11px] text-brand-400 tracking-widest uppercase">
                  Reading Results
                </span>
              </div>
              <div className="p-4 space-y-3">
                {VERDICT_GUIDE.map(({ Icon, color, bg, label, desc }) => (
                  <div key={label} className={`flex items-start gap-3 border rounded-lg px-3 py-3 ${bg}`}>
                    <Icon size={15} className={`${color} mt-0.5 flex-shrink-0`} />
                    <div>
                      <div className={`font-mono text-[11px] font-500 uppercase tracking-widest mb-1 ${color}`}>
                        {label}
                      </div>
                      <p className="font-body text-xs text-steel-400 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Red flags */}
            <div className="bg-steel-900 border border-steel-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-steel-800 flex items-center gap-2">
                <ShieldX size={12} className="text-red-400" />
                <span className="font-mono text-[11px] text-red-400 tracking-widest uppercase">
                  Red Flags — Hang Up
                </span>
              </div>
              <ul className="p-4 space-y-2.5">
                {RED_FLAGS.map(flag => (
                  <li key={flag} className="flex items-start gap-2.5">
                    <span className="text-red-500 mt-0.5 text-xs flex-shrink-0">✕</span>
                    <span className="font-body text-xs text-steel-400 leading-snug">{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick links */}
            <div className="bg-steel-900 border border-steel-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-steel-800">
                <span className="font-mono text-[11px] text-brand-400 tracking-widest uppercase">
                  External Resources
                </span>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { label: 'FMCSA SAFER System', url: 'https://safer.fmcsa.dot.gov/CompanySnapshot.aspx' },
                  { label: 'Carrier411 — Payment History', url: 'https://www.carrier411.com' },
                  { label: 'RMIS — Insurance Verify', url: 'https://www.rmissafety.com' },
                  { label: 'FMCSA Broker Search', url: 'https://li-public.fmcsa.dot.gov/LIVIEW/pkg_carrquery.prc_carrlist' },
                ].map(({ label, url }) => (
                  <a
                    key={label}
                    href={url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-steel-800/60 transition-colors group"
                  >
                    <span className="font-body text-xs text-steel-400 group-hover:text-steel-200 transition-colors">
                      {label}
                    </span>
                    <ExternalLink size={11} className="text-steel-600 group-hover:text-brand-400 flex-shrink-0 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
