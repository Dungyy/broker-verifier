// app/api/broker-check/route.js
// ─────────────────────────────────────────────────────────────
// Server-side FMCSA proxy — keeps key secret, avoids CORS
// Free API key → https://mobile.fmcsa.dot.gov/developer/home.page
// Add to .env.local:  FMCSA_API_KEY=your_key_here
// ─────────────────────────────────────────────────────────────

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  // Strip common prefixes people type: "MC-123456", "MC 123456"
  const raw = searchParams.get('mc') ?? ''
  const mc  = raw.replace(/^(MC|mc)[-\s]?/i, '').replace(/\D/g, '').slice(0, 7)

  if (!mc || mc.length < 4) {
    return Response.json(
      { error: 'Enter a valid MC number (digits only, at least 4).' },
      { status: 400 }
    )
  }

  const key = process.env.FMCSA_API_KEY
  if (!key) {
    // Return demo data so the UI still works without a key during development
    return Response.json(buildDemoResult(mc))
  }

  try {
    const base = 'https://mobile.fmcsa.dot.gov/qc/services/carriers/docket-number'

    const [carrierRes, authRes] = await Promise.allSettled([
      fetch(`${base}/${mc}?webKey=${key}`,             { next: { revalidate: 3600 } }),
      fetch(`${base}/${mc}/authority?webKey=${key}`,   { next: { revalidate: 3600 } }),
    ])

    let carrierData = null
    if (carrierRes.status === 'fulfilled' && carrierRes.value.ok) {
      const j = await carrierRes.value.json()
      carrierData = j?.content?.carrier ?? j?.carrier ?? null
    }

    let authData = null
    if (authRes.status === 'fulfilled' && authRes.value.ok) {
      const j = await authRes.value.json()
      authData = j?.content?.carrierAuthority ?? j?.carrierAuthority ?? null
    }

    if (!carrierData) {
      return Response.json(
        { error: `MC ${mc} not found in FMCSA database.`, notFound: true },
        { status: 404 }
      )
    }

    return Response.json(normalize(mc, carrierData, authData))

  } catch (err) {
    console.error('FMCSA error:', err)
    return Response.json(
      { error: 'Could not reach FMCSA. Try again or visit safer.fmcsa.dot.gov directly.' },
      { status: 502 }
    )
  }
}

// ── Normalize raw FMCSA fields into a clean, typed object ──
function normalize(mc, c, auth) {
  const brokerStatus   = auth?.brokerAuthorityStatus   ?? null
  const commonStatus   = auth?.commonAuthorityStatus   ?? null
  const contractStatus = auth?.contractAuthorityStatus ?? null

  const isActive = ['A'].includes(brokerStatus) || ['A'].includes(commonStatus)
  const isBroker = brokerStatus === 'A' || (c.carrierOperation?.carrierOperationDesc ?? '').toLowerCase().includes('broker')

  const bipdOnFile  = c.bipdInsuranceOnFile  === 'Y'
  const cargoOnFile = c.cargoInsuranceOnFile === 'Y'
  const hasInsurance = bipdOnFile

  const safetyRating = c.safetyRating ?? c.safetyRtng ?? null
  const safetyScore  = rateSafety(safetyRating)

  const oosVehicle = parseFloat(c.oosVehicleInsp  ?? 0)
  const oosDriver  = parseFloat(c.oosDriverInsp   ?? 0)
  const oosHazmat  = parseFloat(c.oosHazmatInsp   ?? 0)

  const crashTotal = parseInt(c.crashTotal ?? 0)
  const crashFatal = parseInt(c.fatalCrash ?? 0)
  const crashInjury = parseInt(c.injCrash  ?? 0)

  const yearsActive = getYears(c.mcsIpDate ?? c.addDate ?? null)

  const verdict = getVerdict({ isActive, hasInsurance, safetyScore, oosVehicle, oosDriver, crashFatal })

  return {
    mc,
    dotNumber:   c.dotNumber ?? null,
    legalName:   c.legalName ?? c.name ?? 'Unknown',
    dbaName:     c.dbaName ?? null,
    address:     [c.phyCity, c.phyState, c.phyZipcode].filter(Boolean).join(', '),
    phone:       c.telephone ?? null,
    entityType:  c.carrierOperation?.carrierOperationDesc ?? null,
    yearsActive,
    mcsDate:     c.mcsIpDate ?? c.addDate ?? null,
    authority: {
      broker:   label(brokerStatus),
      common:   label(commonStatus),
      contract: label(contractStatus),
      isActive,
      isBroker,
      brokerRaw:   brokerStatus,
      commonRaw:   commonStatus,
      contractRaw: contractStatus,
    },
    insurance: {
      hasInsurance,
      bipdOnFile,
      cargoOnFile,
      bondAmount: c.bipdInsuranceRequired ?? null,
    },
    safety: {
      rating: safetyRating,
      score:  safetyScore,
      oosVehicle,
      oosDriver,
      oosHazmat,
    },
    crashes: {
      total:  crashTotal,
      fatal:  crashFatal,
      injury: crashInjury,
    },
    verdict,
    isDemo: false,
  }
}

function label(code) {
  return { A: 'Active', I: 'Inactive', N: 'None', R: 'Revoked' }[code] ?? (code ?? 'Unknown')
}

function rateSafety(r) {
  if (!r) return 'unrated'
  const s = r.toLowerCase()
  if (s.includes('satisfactory'))   return 'good'
  if (s.includes('conditional'))    return 'caution'
  if (s.includes('unsatisfactory')) return 'bad'
  return 'unrated'
}

function getYears(dateStr) {
  if (!dateStr) return null
  try {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24 * 365))
  } catch { return null }
}

function getVerdict({ isActive, hasInsurance, safetyScore, oosVehicle, oosDriver, crashFatal }) {
  if (!isActive)                          return 'REJECT'
  if (!hasInsurance)                      return 'REJECT'
  if (safetyScore === 'bad')              return 'REJECT'
  if (crashFatal > 2)                     return 'CAUTION'
  if (oosVehicle > 30 || oosDriver > 20) return 'CAUTION'
  if (safetyScore === 'caution')          return 'CAUTION'
  return 'APPROVED'
}

// ── Demo data — shown when no API key is set ──
function buildDemoResult(mc) {
  return {
    mc,
    dotNumber:   '3456789',
    legalName:   'DEMO FREIGHT BROKERS INC',
    dbaName:     'Demo Freight',
    address:     'Dallas, TX 75201',
    phone:       '(555) 123-4567',
    entityType:  'Broker',
    yearsActive: 6,
    mcsDate:     '2018-03-14',
    authority: {
      broker:      'Active',
      common:      'None',
      contract:    'None',
      isActive:    true,
      isBroker:    true,
      brokerRaw:   'A',
      commonRaw:   'N',
      contractRaw: 'N',
    },
    insurance: {
      hasInsurance: true,
      bipdOnFile:   true,
      cargoOnFile:  false,
      bondAmount:   '75000',
    },
    safety: {
      rating:     'Satisfactory',
      score:      'good',
      oosVehicle: 12.4,
      oosDriver:  8.1,
      oosHazmat:  0,
    },
    crashes: { total: 2, fatal: 0, injury: 1 },
    verdict: 'APPROVED',
    isDemo: true,
  }
}
