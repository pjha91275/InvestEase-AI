# InvestEase AI 🛡️
### AI-Powered Financial Wellness, Tesseract-OCR Receipt Scanner & Fraud Protection SaaS Platform

InvestEase AI is a modern, premium financial wellness web application built using the Next.js App Router, Tailwind CSS, NextAuth, and MongoDB. It empowers users to budget wisely, log transactions, scan physical receipts directly in the browser via client-side OCR, check SMS or email spam tactics, track savings goals, evaluate overall financial health, and consult a hybrid AI advisor.

---

## 🚀 Key Features

- **Tesseract-OCR Receipt Scanner:** Snaps or uploads billing receipt images, performs browser-based character recognition, and automatically maps structured merchant, date, amount, and category fields to transaction forms.
- **Dynamic Overview Dashboard:** High-level details on current expenditures, residual caps, health gauges, alerts, and recurring bills.
- **Rule-Based Fraud Guard:** Screens inputs instantly against security rules: large limits (₹25,000+), velocity spams (multiple additions in 5 mins), midnight activity (12 AM - 5 AM), and category outliers.
- **Instant Scam Checker:** Heuristic analyzer parsing lookalike brand URLs (e.g., typosquatting paypal/stripe), shortened link networks, and threat words.
- **Financial Health Index (0-100):** Circular gauge mapping savings rates, budget utilization, necessities distribution, and emergency fund coverage.
- **Google Gemini Advisory:** A conversational assistant parsing budget limits or tax questions. Automatically falls back to localized tips if offline or key is missing.
- **Interactive Analytics:** Category share maps and daily spending charts powered by Recharts.
- **Secure Sign-In:** NextAuth credentials flow with secure cryptographic password hashing.

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide Icons, Framer Motion
- **OCR Engine:** Tesseract.js (Client-side browser processing)
- **Backend:** Next.js Serverless Route Handlers
- **Database:** MongoDB (via Mongoose schemas)
- **Authentication:** NextAuth.js
- **Charts:** Recharts
- **AI Model:** Google Gemini API (`gemini-1.5-flash`)

---

## 📁 Directory Structure

```
/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Client Session & Theme wrapping
│   │   ├── page.tsx                  # Premium SaaS Landing Page
│   │   ├── login/page.tsx            # Login card with Demo shortcut
│   │   ├── register/page.tsx         # User Register form
│   │   ├── dashboard/page.tsx        # Overview Dashboard (KPI stats, charts)
│   │   ├── expenses/page.tsx         # Transactions ledger, scanner integration, CRUD
│   │   ├── budget/page.tsx           # Category budget limits & overspent alerts
│   │   ├── savings/page.tsx          # Capital goals progress tracker
│   │   ├── health/page.tsx           # Circular gauge score details & suggestions
│   │   ├── fraud/page.tsx            # Security rules descriptions & alerts log
│   │   ├── scam-checker/page.tsx     # pasted threat analysis interface
│   │   ├── analytics/page.tsx        # Responsive Recharts graphs
│   │   ├── ai-assistant/page.tsx     # Gemini Chat panel with starter prompts
│   │   ├── profile/page.tsx          # Income & job settings, check preference toggles
│   │   ├── settings/page.tsx         # Dark/light toggles and profile deletion
│   │   └── api/                      # Backend Serverless routes
│   ├── components/
│   │   ├── ThemeProvider.tsx         # LocalStorage dark mode hook
│   │   ├── ClientLayout.tsx          # Path layouts splitter
│   │   ├── Navbar.tsx                # Public home navbar
│   │   ├── Sidebar.tsx               # Internal layout sidebar navigation
│   │   ├── ReceiptScanner.tsx        # Tesseract.js OCR scanning component
│   │   └── ui/                       # Reusable glassmorphic UI components
│   ├── lib/
│   │   ├── db.ts                     # MongoDB connection wrapper
│   │   ├── auth.ts                   # NextAuth credentials settings
│   │   ├── gemini.ts                 # Gemini client & localized fallbacks
│   │   └── rules/                    # Rule-based calculation engines
│   └── types/
│       └── next-auth.d.ts            # Type augmentations extending Session with user ID
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (based on `.env.example`):

```ini
MONGODB_URI=mongodb://127.0.0.1:27017/investease
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=investease-ai-secret-key-123456789
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📦 Installation & Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB:**
   Ensure you have a local MongoDB daemon running, or specify a MongoDB Atlas connection string inside `MONGODB_URI`.
   ```bash
   # (Local MongoDB default) mongodb://127.0.0.1:27017/investease
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the platform.

4. **Instant Seeding Demo Account:**
   Click the **"Launch Instantly with Demo Account"** button on the Login page. This automatically registers `demo@investease.ai` and seeds:
   - Category budget caps
   - High-fidelity monthly spending histories
   - Active fraud log flags (large night spending)
   - Three progress savings benchmarks
