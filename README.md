# Broker Checker — Muñoz Trucking

Standalone Next.js app to verify any freight broker's MC number against the live FMCSA database.

## Setup

```bash
npm install
cp .env.local.example .env.local
# Add your FMCSA_API_KEY (free — see below)
npm run dev
```

Open http://localhost:3000

## FMCSA API Key (free, takes 2 min)

1. Go to https://mobile.fmcsa.dot.gov/developer/home.page
2. Register — key is issued instantly
3. Add to .env.local:
   FMCSA_API_KEY=your_key_here

Without a key, the app runs in demo mode with sample data.

## What it checks

- Broker authority status (Active / Inactive / Revoked)
- BIPD & cargo insurance on file
- FMCSA safety rating
- Vehicle & driver out-of-service rates
- Crash history (24 months)
- Years in business

## Verdict logic

- APPROVED  — Active authority + insurance on file + clean safety
- CAUTION   — Active but elevated OOS rates, conditional rating, or recent crashes
- REJECT    — Inactive authority or missing insurance

## Using BrokerChecker as a component

Drop into any page:

  import BrokerChecker from '@/components/BrokerChecker'
  
  <BrokerChecker />                          // full version
  <BrokerChecker compact />                  // no expand panel
  <BrokerChecker onResult={(d) => log(d)} /> // with callback

## File structure

  app/
    page.js                    main UI
    layout.js                  fonts + metadata
    globals.css
    api/broker-check/route.js  FMCSA proxy (server-side)
  components/
    BrokerChecker.js           plug-and-play component
  .env.local.example
# broker-verifier
