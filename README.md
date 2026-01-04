# RECON - Sales Intelligence Platform

**Version:** 2.0
**Status:** Production Ready
**Framework:** Next.js 16.1.1 with Turbopack
**Last Updated:** 2026-01-03

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Installation & Setup](#installation--setup)
6. [API Keys & Configuration](#api-keys--configuration)
7. [Database Schema](#database-schema)
8. [Component Structure](#component-structure)
9. [API Endpoints](#api-endpoints)
10. [Design System](#design-system)
11. [Deployment](#deployment)
12. [Usage Guide](#usage-guide)
13. [Troubleshooting](#troubleshooting)

---

## Overview

RECON is a professional B2B sales intelligence platform designed for financial services outreach. It aggregates real-time data from multiple sources to provide comprehensive company intelligence, executive contacts, financial metrics, SEC filings, and market sentiment analysis.

### Key Capabilities

- **Company Intelligence**: Automated research gathering for any company
- **Executive Contacts**: LinkedIn executive discovery with role categorization
- **Financial Health**: Real-time financial metrics with health scoring
- **SEC Filings**: Automated 10-K/10-Q analysis with key insights
- **Stock Analysis**: 1-year price charts with 6-month sparklines
- **News Sentiment**: Aggregated news feed with sentiment scoring
- **Conference Search**: Event appearance tracking for executives

---

## Features

### 1. Company Intelligence Dashboard

- **Operational Focus**: AI-generated company overview
- **Key Metrics**: Revenue, headquarters, organization type, industry
- **IT Signal**: Technology initiatives and digital transformation news
- **Stature**: Market position assessment

### 2. High Value Targets (Contacts)

- **Executive Discovery**: Automated LinkedIn search for C-Suite, VPs, Directors
- **Role Categorization**:
  - C-Suite (CEO, CTO, CFO, COO, CIO, CMO, etc.)
  - Heads (Head of Engineering, Head of Product, etc.)
  - VP/SVP (Vice Presidents, Senior Vice Presidents)
  - Directors (Director, Senior Director)
- **Connection Tracking**: LinkedIn connection degree
- **Conference Appearances**: Search for speaking engagements and events
- **Person Detail Drawer**: Individual contact deep-dive

### 3. Financial Health Module

- **Health Score**: 0-100 calculated from financial metrics
- **6-Month Sparkline**: Visual trend indicator
- **Status Indicator**: Healthy (80+), Stable (60-79), At Risk (<60)
- **Financial Audit Trail**: Detailed metrics table with:
  - Revenue Growth
  - Net Income
  - Operating Margin
  - Debt-to-Equity Ratio
  - Current Ratio
  - ROE (Return on Equity)

### 4. SEC Filings Intelligence

- **Automated 10-K/10-Q Parsing**: Latest filings automatically analyzed
- **Risk Factors**: Top 3 identified risks from filings
- **Legal Exposure**: Lawsuit tracking with financial impact
- **Strategic Priorities**: Extracted from MD&A sections
- **Executive Changes**: 8-K form monitoring
- **Filing Links**: Direct SEC EDGAR access

### 5. News & Sentiment Analysis

- **Sentiment Meter**: -100 to +100 visual gauge with needle indicator
- **24-Hour Article Count**: Real-time news monitoring
- **Relevance Scoring**: 0-100 for each article
- **Aggregated Feed**: Sorted by relevance

### 6. Stock Price Tracking

- **1-Year Chart**: Historical price data from Polygon.io
- **Gradient Visualization**: Green/red fill based on performance
- **Ticker Integration**: Automatic symbol resolution

### 7. Hiring Intelligence

- **Job Openings Analysis**: Real-time data from PredictLeads API
- **Department Breakdown**: Engineering vs. Sales vs. Marketing
- **Vertical Bar Chart**: Monochrome blue color palette for clean visualization
- **Total Headcount**: Aggregated open positions
- **Hiring Signal**: Identifies which department is actively growing

---

## Technology Stack

### Frontend

- **Framework**: Next.js 16.1.1 (App Router)
- **Build Tool**: Turbopack (Next.js default)
- **UI Library**: React 19.2.3
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion 12.23
- **Charts**: Recharts 3.6
- **Language**: TypeScript 5

### Backend

- **Runtime**: Node.js (server-side Next.js)
- **Database**: SQLite with better-sqlite3 12.5
- **API Routes**: Next.js Route Handlers

### Third-Party APIs

- **Serper API**: Web search & LinkedIn intelligence
- **Polygon.io**: Stock market data
- **SEC EDGAR**: Government financial filings
- **Alpha Vantage**: Financial metrics
- **PredictLeads**: Job openings & hiring intelligence
- **Brandfetch**: Company logos & autocomplete

---

## Architecture

### Application Structure

```
stalker-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Route Handlers
│   │   ├── intel/route.ts        # Company intelligence endpoint
│   │   ├── targets/route.ts      # LinkedIn executive search
│   │   ├── sec-filings/route.ts  # SEC data processing
│   │   ├── stock-price/route.ts  # Stock chart data
│   │   └── conference-search/route.ts # Event search
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   ├── globals.css               # Global styles & design tokens
│   └── page.tsx                  # Main dashboard page
│
├── components/                   # React Components
│   ├── HighValueTargets.tsx      # Executive contacts module
│   ├── FinancialHealth.tsx       # Financial metrics & health score
│   ├── SECFilings.tsx            # SEC filing analysis
│   ├── NewsSentiment.tsx         # News aggregation & sentiment
│   ├── StockChart.tsx            # Stock price visualization
│   ├── PersonDetailDrawer.tsx    # Contact detail panel
│   ├── IntelligenceLog.tsx       # Loading state component
│   └── ErrorBoundary.tsx         # Error handling wrapper
│
├── lib/                          # Utility Libraries
│   ├── serper.ts                 # Serper API integration
│   ├── sec.ts                    # SEC EDGAR API client
│   └── db.ts                     # Database utilities
│
├── public/                       # Static assets
│
├── .env                          # Environment variables (API keys)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS config
└── next.config.ts                # Next.js configuration
```

### Data Flow

```
User Search
    ↓
app/page.tsx (Frontend)
    ↓
API Routes (/api/*)
    ↓
├── Serper API (Web Intelligence)
├── SEC EDGAR API (Filings)
├── Polygon.io (Stock Data)
└── SQLite Cache (Performance)
    ↓
Components (Render)
```

### Caching Strategy

- **Company Intelligence**: 7-day cache in `company-metadata.db`
- **SEC Filings**: 2-year cache in `sec-cache.db`
- **Stock Data**: No cache (real-time)
- **News Sentiment**: No cache (real-time)

---

## Installation & Setup

### Prerequisites

- **Node.js**: v18+ or v20+ recommended
- **npm**: v8+ or yarn/pnpm
- **Operating System**: Windows, macOS, or Linux

### Step 1: Clone/Download Repository

```bash
# If you have the folder already
cd stalker-app

# Or clone from repository
git clone <your-repo-url> stalker-app
cd stalker-app
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 16.1.1
- React 19
- Tailwind CSS 4
- TypeScript 5
- Recharts
- Framer Motion
- better-sqlite3
- All type definitions

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory (see next section for details).

### Step 4: Initialize Databases

```bash
npm run init-db
```

This creates:
- `company-metadata.db` - Company intelligence cache
- `sec-cache.db` - SEC filing cache
- `stalker.db` - General application data

### Step 5: Run Development Server

```bash
npm run dev
```

Server starts at: **http://localhost:3000**

### Step 6: Build for Production

```bash
npm run build
npm start
```

---

## API Keys & Configuration

### Required Environment Variables

Create a `.env` file in the project root:

```env
# Serper API Key for web search intelligence gathering
# Get your API key from: https://serper.dev/
SERPER_API_KEY=your_serper_api_key_here

# Alpha Vantage API Key for revenue data and financial charts
# Get your FREE API key from: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here

# Polygon.io API Key for 1-year stock price charts
# Get your API key from: https://polygon.io/
POLYGON_API_KEY=your_polygon_api_key_here

# PredictLeads API Key for hiring intelligence data
# Get your API key from: https://www.predictleads.com/
PREDICTLEADS_API_KEY=your_predictleads_api_key_here

# Brandfetch API Key for company logo autocomplete (optional)
# Get your API key from: https://brandfetch.com/
# Note: NEXT_PUBLIC_ prefix makes this available on the client side
NEXT_PUBLIC_BRANDFETCH_CLIENT_ID=your_brandfetch_client_id
```

### API Key Setup Instructions

#### 1. Serper API (Required - $50 free credit)

1. Visit: https://serper.dev/
2. Sign up with Google/GitHub
3. Get API key from dashboard
4. Free tier: 2,500 searches
5. Used for: LinkedIn searches, company news, HQ detection

#### 2. Polygon.io (Required for stock charts - Free tier available)

1. Visit: https://polygon.io/
2. Sign up for account
3. Get API key from dashboard
4. Free tier: 5 API calls/minute
5. Used for: 1-year stock price data

#### 3. Alpha Vantage (Optional - Free)

1. Visit: https://www.alphavantage.co/support/#api-key
2. Enter email to get key instantly
3. Free tier: 25 requests/day
4. Used for: Financial metrics, revenue data

#### 4. PredictLeads (Optional - Hiring Intelligence)

1. Visit: https://www.predictleads.com/
2. Sign up for account
3. Get API key from dashboard
4. Used for: Job openings data (Engineering/Sales/Marketing breakdown)

#### 5. Brandfetch (Optional - Enhances UX)

1. Visit: https://brandfetch.com/
2. Sign up for account
3. Get Client ID from dashboard
4. Used for: Company logo autocomplete

### API Rate Limits & Costs

| API | Free Tier | Paid Plans | Cost/Request |
|-----|-----------|------------|--------------|
| Serper | 2,500 searches | $50/5,000 | $0.01 |
| Polygon.io | 5 calls/min | Unlimited | Varies |
| Alpha Vantage | 25/day | 1,200/day | Free/$50/mo |
| PredictLeads | Varies | Custom | Contact vendor |
| Brandfetch | Limited | Unlimited | Free/Premium |

### Environment Variable Security

**IMPORTANT:**
- Never commit `.env` to version control
- Add `.env` to `.gitignore`
- Use `.env.local` for local overrides
- Use Vercel/hosting platform secrets for production

---

## Database Schema

### 1. Company Metadata Cache (`company-metadata.db`)

**Table: `company_metadata`**

```sql
CREATE TABLE company_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL UNIQUE,
  operational_focus TEXT,
  industry TEXT,
  org_type TEXT,
  region TEXT,
  hq TEXT,
  revenue TEXT,
  stature TEXT,
  it_signal TEXT,
  executive_summary TEXT,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose:** Caches AI-generated company intelligence for 7 days

### 2. SEC Filings Cache (`sec-cache.db`)

**Table: `sec_filings_cache`**

```sql
CREATE TABLE sec_filings_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cik TEXT NOT NULL,
  company_name TEXT NOT NULL,
  filing_type TEXT NOT NULL,
  filing_date TEXT,
  accession_number TEXT,
  filing_url TEXT,
  risk_factors TEXT,
  legal_proceedings TEXT,
  mda_section TEXT,
  fiscal_year_end TEXT,
  financial_metrics TEXT,
  strategic_priorities TEXT,
  executive_changes TEXT,
  legal_exposure TEXT,
  cached_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
);
```

**Purpose:** Caches parsed SEC filings for 2 years (filings don't change)

### 3. General Database (`stalker.db`)

Currently unused - reserved for future features like:
- User accounts
- Saved searches
- Contact notes
- Activity tracking

---

## Component Structure

### Core Components

#### 1. `app/page.tsx` - Main Dashboard

**Responsibilities:**
- Search input with Brandfetch autocomplete
- Company intelligence API orchestration
- 3-column Bento grid layout
- Loading states
- Error handling

**State Management:**
```typescript
const [searchResult, setSearchResult] = useState<CompanyIntel | null>(null);
const [targets, setTargets] = useState<LinkedInTarget[]>([]);
const [loading, setLoading] = useState(false);
```

**Layout Structure:**
```
┌─────────────────────────────────────────┐
│         Header (Search Bar)             │
├──────────┬────────────────┬─────────────┤
│ Column 1 │   Column 2     │  Column 3   │
│ (3 cols) │   (6 cols)     │  (3 cols)   │
├──────────┼────────────────┼─────────────┤
│ Company  │ Financial      │ Key         │
│ Summary  │ Health         │ Contacts    │
│          │                │             │
│          ├────────────────┤             │
│          │ SEC Filings    │ News &      │
│          │                │ Sentiment   │
└──────────┴────────────────┴─────────────┘
```

#### 2. `HighValueTargets.tsx` - Executive Contacts

**Features:**
- Collapsed card: Total count + role breakdown
- Modal: Vertical contact cards
- Person detail drawer integration
- Conference search button

**Role Categorization Logic:**
```typescript
function categorizeContact(title: string): 'C-Suite' | 'Head' | 'VP/SVP' | 'Director' | 'Other' {
  if (title.match(/ceo|cfo|cto|chief|president|founder/i)) return 'C-Suite';
  if (title.match(/\bhead\b/i)) return 'Head';
  if (title.match(/\b(vp|vice president|svp|evp)\b/i)) return 'VP/SVP';
  if (title.match(/\bdirector\b/i)) return 'Director';
  return 'Other';
}
```

#### 3. `FinancialHealth.tsx` - Financial Metrics

**Health Score Calculation:**
```typescript
const healthScore = (successCount / totalMetrics) * 100;
const status = healthScore >= 80 ? 'Healthy' : healthScore >= 60 ? 'Stable' : 'At Risk';
```

**Metrics Tracked:**
- Revenue Growth (YoY %)
- Net Income
- Operating Margin
- Debt-to-Equity Ratio
- Current Ratio
- Return on Equity (ROE)

#### 4. `SECFilings.tsx` - SEC Intelligence

**Features:**
- Latest 10-K/10-Q display
- Risk factors extraction (top 3)
- Legal proceedings summary
- Strategic priorities from MD&A
- Executive changes from 8-K forms
- Legal exposure calculation

**Data Sources:**
- SEC EDGAR API (submissions)
- XBRL financial facts
- Full text filing parsing

#### 5. `NewsSentiment.tsx` - News Analysis

**Sentiment Calculation:**
```typescript
const sentimentScore = calculateWeightedSentiment(articles); // -100 to +100
const label = sentimentScore > 30 ? 'Positive' : sentimentScore < -30 ? 'Negative' : 'Neutral';
```

**Components:**
- Collapsed: Sentiment meter with needle
- Modal: Article feed sorted by relevance

#### 6. `StockChart.tsx` - Stock Visualization

**Features:**
- 1-year historical data
- Gradient area chart (green/red)
- Price range display
- Ticker symbol

---

## API Endpoints

### 1. `POST /api/intel`

**Purpose:** Company intelligence gathering

**Request:**
```json
{
  "company_name": "PayPal"
}
```

**Response:**
```json
{
  "company_name": "PayPal",
  "operational_focus": "Global digital payments platform...",
  "industry": "Financial Services",
  "org_type": "Payment Processor",
  "region": "West",
  "hq": "San Jose, CA",
  "revenue": "$29.77B (2023)",
  "stature": "Market Leader",
  "it_signal": "• Cloud infrastructure modernization\n• AI fraud detection",
  "executive_summary": "PayPal is a leading fintech..."
}
```

**Caching:** 7 days in `company-metadata.db`

### 2. `POST /api/targets`

**Purpose:** LinkedIn executive search

**Request:**
```json
{
  "company": "PayPal"
}
```

**Response:**
```json
{
  "targets": [
    {
      "name": "Dan Schulman",
      "title": "CEO",
      "linkedinUrl": "https://linkedin.com/in/danschulman",
      "snippet": "CEO of PayPal Holdings, Inc.",
      "location": "San Jose, CA",
      "connection": "2nd"
    }
  ]
}
```

**Search Strategy:**
1. Try: `"Company" LinkedIn (CEO OR CTO OR CFO...)`
2. Filter: Only `linkedin.com/in/` URLs
3. Parse: Extract name, title, location
4. Score: Relevance ranking

### 3. `POST /api/sec-filings`

**Purpose:** SEC filing analysis

**Request:**
```json
{
  "company": "PayPal"
}
```

**Response:**
```json
{
  "cik": "0001633917",
  "companyName": "PayPal Holdings, Inc.",
  "filings": {
    "latest10K": {
      "date": "2024-02-08",
      "url": "https://sec.gov/...",
      "riskFactors": ["Cybersecurity threats", "Regulatory changes", "Competition"],
      "legalProceedings": "Ongoing litigation...",
      "strategicPriorities": ["Expand crypto", "Improve checkout"],
      "fiscalYearEnd": "December 31"
    }
  },
  "financialMetrics": { ... },
  "legalExposure": "$50M across 3 cases"
}
```

**Caching:** 2 years in `sec-cache.db`

### 4. `POST /api/stock-price`

**Purpose:** Stock chart data

**Request:**
```json
{
  "ticker": "PYPL",
  "period": "1year"
}
```

**Response:**
```json
{
  "ticker": "PYPL",
  "prices": [
    { "date": "2025-01-01", "close": 62.50 },
    { "date": "2025-01-02", "close": 63.10 }
  ]
}
```

**Data Source:** Polygon.io Aggregates API

### 5. `POST /api/conference-search`

**Purpose:** Executive event appearances

**Request:**
```json
{
  "targetName": "Dan Schulman"
}
```

**Response:**
```json
{
  "conferences": [
    {
      "eventName": "FinTech Summit 2025",
      "date": "2025-03-15",
      "role": "Keynote Speaker",
      "location": "San Francisco, CA",
      "url": "https://..."
    }
  ]
}
```

---

## Design System

### Color Palette (OLED Optimized)

```css
--bg-primary: #000000;        /* Pure OLED black */
--bg-secondary: #0a0a0a;      /* Slightly lighter black */
--text-primary: #E0E0E0;      /* Off-white (anti-halation) */
--text-secondary: #888888;    /* Gray labels */
--accent-apple-blue: #007AFF; /* Primary interactions */
--accent-cyan: #10b981;       /* Success/growth */
--accent-amber: #fb923c;      /* Warnings */
--accent-indigo: #6366f1;     /* AI/Director */
--border-primary: #333333;    /* Borders */
--border-slate: #1e293b;      /* Darker borders */
```

### Typography System

**Mixed Typography Pairing (2026 Fintech Standard)**

```typescript
// layout.tsx
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
```

**Typography Rules:**
- **Inter (UI)**: Names, labels, narratives, descriptive text
- **JetBrains Mono (Data)**: Counts, dates, metrics, financial data
- **Letter Spacing**: `0.02em` for all monospace data

**CSS Classes:**
```css
.font-ui { font-family: var(--font-inter); }
.font-mono-data { font-family: var(--font-jetbrains-mono); letter-spacing: 0.02em; }
```

### Component Patterns

#### Modal Standard

```tsx
<div
  className="fixed inset-0 bg-black bg-opacity-80 z-50"
  style={{ backdropFilter: 'blur(10px)' }}
  onClick={onClose}
>
  <div
    className="bg-[#000000] border border-[#333333] rounded-lg"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Content */}
  </div>
</div>
```

**Features:**
- Esc key to close
- Click outside to close
- Blur backdrop
- Stop propagation on content

#### Button Styles

```tsx
// Primary Action
<button className="bg-[#007AFF] text-[#000000] font-ui font-bold px-4 py-2 rounded">
  Primary
</button>

// Secondary Action
<button className="border border-[#007AFF] bg-[#007AFF] bg-opacity-10 text-[#007AFF] px-4 py-2 rounded">
  Secondary
</button>
```

#### Glass Card (Bento)

```tsx
<div className="glass-bento rounded-lg overflow-hidden">
  {/* Content */}
</div>
```

**CSS:**
```css
.glass-bento {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-primary);
}
```

---

## Deployment

### Deploy to Vercel (Recommended)

#### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

#### Step 2: Connect to Vercel

1. Visit: https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or `stalker-app` if in subfolder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

#### Step 3: Add Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
SERPER_API_KEY=your_serper_key
POLYGON_API_KEY=your_polygon_key
ALPHA_VANTAGE_API_KEY=your_alphavantage_key
NEXT_PUBLIC_BRANDFETCH_CLIENT_ID=your_brandfetch_id
```

#### Step 4: Deploy

- Click "Deploy"
- Vercel will automatically:
  - Install dependencies
  - Build Next.js app
  - Deploy to edge network
  - Assign domain (e.g., `recon.vercel.app`)

#### Step 5: Configure Custom Domain (Optional)

1. Go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Deploy to Other Platforms

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build
npm run build

# Deploy
netlify deploy --prod
```

#### Railway / Render / Fly.io

1. Create `Dockerfile` (if needed)
2. Set environment variables
3. Deploy via platform CLI/dashboard

#### Self-Hosted (VPS/EC2)

```bash
# Build
npm run build

# Start with PM2
pm2 start npm --name "recon" -- start

# Or use systemd service
```

### Database Considerations for Production

**Current Setup (SQLite):**
- Works on Vercel/Netlify (ephemeral)
- Cache cleared on each deployment
- No persistence between deploys

**For Persistent Caching:**

Option 1: **PostgreSQL** (Vercel Postgres, Supabase)
- Migrate schema to PostgreSQL
- Update `lib/db.ts` to use `pg` library

Option 2: **Redis** (Upstash, Vercel KV)
- Use for caching layer
- Faster than database queries

Option 3: **External SQLite** (Turso, LiteFS)
- Keep SQLite but use distributed version

---

## Usage Guide

### Basic Workflow

1. **Open App**: Navigate to http://localhost:3000
2. **Search Company**: Type company name (e.g., "PayPal")
3. **Autocomplete**: Select from Brandfetch suggestions
4. **Intelligence Log**: Watch real-time data gathering
5. **View Dashboard**: Explore 3-column Bento grid
6. **Expand Modules**: Click cards to see detailed modals
7. **Contact Details**: Click contacts to open detail drawer
8. **Conference Search**: Find executive speaking engagements

### Search Tips

**Best Results:**
- Use full company names: "PayPal Holdings" not "PP"
- Include legal entity if ambiguous: "Apple Inc." not just "Apple"
- For banks: Use official name: "JPMorgan Chase" not "Chase Bank"

**Autocomplete:**
- Start typing → suggestions appear
- Click suggestion → auto-submits search
- Or press Enter to search without selecting

### Understanding Modules

#### Company Summary (Column 1)

- **Operational Focus**: What the company does
- **Industry**: Sector classification
- **Revenue**: Latest annual revenue (if available)
- **Stature**: Market position (Leader, Challenger, Emerging)
- **IT Signal**: Recent tech initiatives from news

#### Financial Health (Column 2)

- **Health Score**: 0-100 (Healthy: 80+, Stable: 60-79, At Risk: <60)
- **Sparkline**: 6-month financial trend
- **Click Card**: See full Financial Audit Trail

**Interpreting Metrics:**
- ✓ (Green check): Metric is healthy
- ⚠ (Amber warning): Metric needs attention

#### SEC Filings (Column 2)

- **Latest 10-K**: Annual report (filed yearly)
- **Latest 10-Q**: Quarterly report (filed 4x/year)
- **Risk Factors**: Top 3 business risks
- **Legal Exposure**: Active lawsuits with $ amounts
- **Strategic Priorities**: Company's stated goals

#### Key Contacts (Column 3)

- **Total Contacts**: All executives found
- **Role Breakdown**: C-Suite, Heads, VPs, Directors
- **Click Card**: See all contacts with LinkedIn links
- **Find Events**: Search for conference appearances

#### News & Sentiment (Column 3)

- **Sentiment Score**: -100 (very negative) to +100 (very positive)
- **Meter**: Visual gauge with needle indicator
- **24h Articles**: Recent news count
- **Click Card**: Read full news feed sorted by relevance

### Power User Tips

1. **Cache Awareness**:
   - Company intel cached 7 days
   - SEC filings cached 2 years
   - Re-search to force refresh

2. **Contact Filtering**:
   - If no contacts found, try different company name variations
   - Some private companies have limited LinkedIn presence

3. **Stock Charts**:
   - Only works for publicly traded companies
   - Requires valid ticker symbol

4. **Conference Search**:
   - Works best for high-profile executives
   - May not find results for all contacts

---

## Troubleshooting

### Common Issues

#### 1. "✗ MANUAL SEARCH REQUIRED" for Contacts

**Cause:** Serper API error or no LinkedIn profiles found

**Solutions:**
- Verify `SERPER_API_KEY` in `.env`
- Check Serper API quota: https://serper.dev/dashboard
- Try different company name variation
- Check server logs for detailed error

#### 2. No Stock Chart Appearing

**Cause:** Invalid ticker or Polygon.io API issue

**Solutions:**
- Verify company is publicly traded
- Check `POLYGON_API_KEY` in `.env`
- Check Polygon.io rate limits (5 calls/min free tier)

#### 3. SEC Filings Not Loading

**Cause:** Company not in SEC database (private company)

**Expected:**
- Only public US companies file with SEC
- Private companies (Stripe, etc.) won't have SEC data

#### 4. Build Errors

**Common Issues:**
```bash
# TypeScript errors
npm run build

# Module not found
npm install
rm -rf node_modules
npm install

# Port already in use
kill -9 $(lsof -ti:3000)  # macOS/Linux
taskkill /F /IM node.exe  # Windows
```

#### 5. Database Errors

**Solutions:**
```bash
# Reinitialize databases
npm run init-db

# Or manually delete and recreate
rm *.db
npm run init-db
```

#### 6. Environment Variables Not Loading

**Check:**
- File is named exactly `.env` (not `.env.txt`)
- No quotes around values: `KEY=abc123` not `KEY="abc123"`
- Restart dev server after changes
- For `NEXT_PUBLIC_*` vars, rebuild app

### Debugging

**Enable Verbose Logging:**

Check server terminal (where you ran `npm run dev`) for:
- API request logs
- Serper query attempts
- Cache hits/misses
- Error stack traces

**Common Log Messages:**
```
✓ Cache HIT for <company> HQ (1 days old)
✗ Cache MISS for CIK <number>
Serper API error: 400 - {"message":"Query not allowed"}
Found 15 LinkedIn targets for <company>
```

### Getting Help

**Reporting Issues:**

Include:
1. Company name searched
2. Error message from UI
3. Server logs from terminal
4. Browser console errors (F12)
5. Environment (OS, Node version)

---

## Performance Optimization

### Current Optimizations

1. **Database Caching**:
   - Company intel: 7-day TTL
   - SEC filings: 2-year TTL
   - Reduces API calls by ~80%

2. **Turbopack**:
   - Fast refresh (~1s rebuild)
   - Optimized bundling

3. **Next.js Image Optimization**:
   - Automatic WebP conversion
   - Lazy loading

4. **React 19 Compiler**:
   - Automatic memoization
   - Reduced re-renders

### Future Optimizations

1. **Server Components**: Convert static components
2. **Streaming SSR**: Faster initial page load
3. **Edge Functions**: Deploy API routes to edge
4. **Redis Caching**: Replace SQLite for distributed systems
5. **API Response Caching**: Cache Serper/Polygon responses

---

## Security Considerations

### API Key Security

**Current:**
- Keys stored in `.env` (server-side only)
- Not exposed to client (except `NEXT_PUBLIC_*`)

**Production:**
- Use platform secrets (Vercel, Netlify)
- Rotate keys periodically
- Set up API key restrictions (IP whitelist)

### Data Privacy

**User Data:**
- No user authentication currently
- No PII storage
- All searches are stateless

**Third-Party Data:**
- Serper: Privacy policy applies
- SEC: Public government data
- LinkedIn: Scraping via Google (compliant)

### Rate Limiting

**Recommended:**
- Implement IP-based rate limiting
- Add CAPTCHA for heavy usage
- Monitor API usage quotas

---

## Future Roadmap

### Planned Features

1. **User Accounts**:
   - Save searches
   - Contact notes
   - Activity history

2. **Email Alerts**:
   - SEC filing notifications
   - News sentiment changes
   - Executive moves

3. **CRM Integration**:
   - Salesforce connector
   - HubSpot integration
   - CSV export

4. **Advanced Analytics**:
   - Competitor comparison
   - Industry trends
   - Market share analysis

5. **AI Enhancements**:
   - GPT-4 executive summaries
   - Predictive health scores
   - Recommended outreach timing

6. **Collaboration**:
   - Team workspaces
   - Shared contact lists
   - Notes and tags

---

## License

**Proprietary** - All rights reserved

This application is for internal use only. Unauthorized distribution or reproduction is prohibited.

---

## Credits

**Built with:**
- Next.js by Vercel
- React by Meta
- Tailwind CSS
- Recharts
- Framer Motion

**Data Sources:**
- Serper.dev
- SEC EDGAR
- Polygon.io
- Alpha Vantage
- Brandfetch

**Developed by:** [Your Name/Team]
**Version:** 2.0
**Last Updated:** January 3, 2026

---

## Contact & Support

**For technical issues:**
- Check [Troubleshooting](#troubleshooting) section
- Review server logs
- Check API status pages

**For feature requests:**
- Document use case
- Provide mockups if applicable
- Consider API limitations

---

**Happy Intelligence Gathering! 🔍**
