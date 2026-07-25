# InvestEase AI 🚀
### Every Rupee Counts. Every Round-Up Builds Your Future.

**InvestEase AI** is a premium, national-hackathon-winning financial wellness platform designed to solve a universal consumer problem: people spend money daily without realizing how minor, unused fractions (change margins) can build compounding wealth over time. 

Instead of another static expense logging CRUD app, **InvestEase AI** automatically captures spare changes on transaction clearances, allocates them according to custom asset distributions, and sweeps them into a virtual portfolio simulator. It is packed with browser-based OCR receipt scanning, dynamic Recharts visualizations, a financial health scoring engine, and a fallback AI Spending Coach.

---

## 👥 Team CodeCrafters
* **Prince Jha** (Leader & Full-Stack Architect)
* **Sachin Jha** (Frontend & Data Visualization Lead)
* **Bhavesh Jadhav** (Backend Services & Database Engineer)
* **Ishaan Dubey** (AI Integrations & Quality Assurance)

---

## 🛠️ Complete Tech Stack

* **Frontend Framework**: **Next.js 16** (App Router Architecture, React 19)
* **Styling**: **Tailwind CSS v4** (Custom variables-based dark design system)
* **Data Visualization**: **Recharts** (Compounding Growth charts & Allocation Pies)
* **OCR Client Engine**: **Tesseract.js** (Client-side in-browser text recognition)
* **Backend Runtime**: **Next.js Serverless Route Handlers** (Node.js runtime environment)
* **Database Layer**: **MongoDB** (Mongoose ORM with connection caching for serverless scale)
* **Authentication**: **NextAuth.js** (Credentials Provider with cryptographic **bcryptjs** hashing)
* **Advisory AI**: **Google Gemini API** (`gemini-1.5-flash` model for chat insights & receipt parsing)

---

## 🗺️ Mermaid Architecture Diagram

```mermaid
graph TD
    User([User Browser Interface]) -->|1. Snaps Receipt / Input Form| ClientLayout[React 19 Frontend App Router]
    
    subgraph ClientEngine ["Client Engine (Tesseract & Recharts)"]
        ClientLayout -->|OCR Scanning| OCR[Tesseract.js OCR Engine]
        ClientLayout -->|Asset Performance| SimView[Portfolio Simulator Slider / Recharts]
    end

    ClientLayout -->|2. REST Actions| NextAPI[Next.js Serverless Routes]
    
    subgraph ServerlessBackend ["Serverless Backend"]
        NextAPI -->|Category Recognition| Rules[AI Category Rule Engine]
        NextAPI -->|Auto Roundups & Sweeps| RoundupEngine[spare change sweep rules]
        NextAPI -->|Market Drifts simulation| SimulationEngine[Drift Volatility Matrix]
        NextAPI -->|Financial Wellness score| HealthEngine[Health Index scoring rules]
        NextAPI -->|Gemini Assistant| ChatAPI[Google Gemini Client API]
    end

    NextAPI -->|3. Database logs| DB[(MongoDB Mongoose)]
    
    subgraph DatabaseCollections ["Database Collections"]
        DB === Users[(Users)]
        DB === Expenses[(Expenses)]
        DB === Roundups[(Roundups)]
        DB === Portfolio[(Portfolios)]
        DB === Investments[(Investments)]
        DB === SavingsGoal[(SavingsGoals)]
        DB === Notification[(Notifications)]
        DB === Chat[(Chat Logs)]
    end
```

---

## 📁 Detailed Folder Structure

```
InvestEase AI/
├── src/
│   ├── app/                          # Next.js App Router Pages
│   │   ├── page.tsx                  # Premium Startup Landing Page
│   │   ├── login/page.tsx            # Login panel with demo account shortcut
│   │   ├── register/page.tsx         # Signup form with instant DB seeding hooks
│   │   ├── dashboard/page.tsx        # Overview stats, categories pie charts, KPI meters
│   │   ├── expenses/page.tsx         # Transaction ledger & Tesseract OCR scanning panel
│   │   ├── budget/page.tsx           # Category spend thresholds tracker
│   │   ├── savings/page.tsx          # Savings goals pots (Macbook, emergency fund)
│   │   ├── portfolio/page.tsx        # Smart Portfolio Simulator allocations sliders
│   │   ├── health/page.tsx           # Financial health index scores & radial gauges
│   │   ├── analytics/page.tsx        # Category shares & compound growth timeline charts
│   │   ├── ai-assistant/page.tsx     # Spending coach dialogue interface
│   │   ├── profile/page.tsx          # Income & notify settings preferences
│   │   ├── settings/page.tsx         # Dark mode configuration and password controls
│   │   └── api/                      # Serverless API endpoints
│   │       ├── expenses/route.ts     # CRUD ledger and auto roundup sweeps engine
│   │       ├── expenses/scan/route.ts # Receipt image OCR text parser
│   │       ├── portfolio/route.ts    # Get details / update allocation parameters
│   │       ├── portfolio/simulate/route.ts # Drift asset balances based on volatility
│   │       ├── dashboard/route.ts    # Aggregates KPI balances and history logs
│   │       ├── register/route.ts     # User signup & automatic demo populate seeders
│   │       ├── settings/password/route.ts # Password validation & update flow (bcryptjs)
│   │       └── chat/route.ts         # Hybrid Gemini Spending coach fallback advisor
│   ├── components/                   # Shared React UI Components
│   │   ├── ThemeProvider.tsx         # Context-managed dark styling provider
│   │   ├── ClientLayout.tsx          # Structural layout viewport splitter
│   │   ├── Sidebar.tsx               # Left dashboard navigation bar
│   │   └── ReceiptScanner.tsx        # Drag-and-drop Tesseract canvas processor
│   ├── lib/                          # Database connection and backend helper rules
│   │   ├── db.ts                     # Cached MongoDB Mongoose initialization
│   │   ├── auth.ts                   # NextAuth credentials authentication configuration
│   │   ├── gemini.ts                 # Gemini configuration & history sanitization helper
│   │   ├── rules/
│   │   │   └── health.ts             # Financial Health score calculator rules engine
│   │   └── models/                   # Mongoose Database Models
│   │       ├── User.ts               # User schema
│   │       ├── Expense.ts            # Expense transactions schema
│   │       ├── Roundup.ts            # Spare change transaction margins
│   │       ├── Portfolio.ts          # Holdings balances across 5 asset classes
│   │       ├── Investment.ts         # Log of sweeps history
│   │       ├── SavingsGoal.ts        # Target pots metrics
│   │       ├── Notification.ts       # Logs of alert notifications
│   │       └── Chat.ts               # Chat log contexts
├── public/                           # Vector icons and site static assets
├── scratch/                          # Diagnostics script directory (ignored in git)
│   └── test_scan.js                  # Local parser testing harness
├── .gitignore                        # Git configuration mappings
├── .env.example                      # Production environment variables seeding template
├── package.json                      # Project dependencies and workspace scripts
├── tsconfig.json                     # TypeScript settings config
└── README.md                         # Master Hackathon Documentation
```

---

## 🗄️ Database Models
* **User**: Profile details (monthly salary and savings targets).
* **Expense**: Spend transactions and OCR-scanned details.
* **Roundup**: Fraction difference margins (e.g. ₹0.35 saved from a ₹421.65 expense).
* **Portfolio**: Holdings across Index Funds, Mutual Funds, Stocks, Gold, and Crypto.
* **Investment**: Logs detailing allocations applied to sweeps.
* **SavingsGoal**: Target pot milestones (Emergency Fund, Bike, Macbook).
* **Notification**: Log triggers for overspent alerts and returns simulation.

---

## 🔌 API Routes Summary

* **`/api/expenses`**: `GET` transactions list / `POST` transaction. Calculates roundups and splits them across portfolio balances.
* **`/api/portfolio`**: `GET` asset balances and timeline / `PUT` allocations split targets (must sum to 100%).
* **`/api/portfolio/simulate`**: `POST` market drifts (runs Brownian drift volatility updates).
* **`/api/expenses/scan`**: `POST` parsing OCR scanned text to return JSON fields.
* **`/api/settings/password`**: `POST` checks current password and saves hashed credentials.

---

## ⚙️ Environment Variables

Create `.env` in root:
```ini
MONGODB_URI=mongodb://127.0.0.1:27017/investease
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=investease-ai-secret-key-987654321
GEMINI_API_KEY=your_google_gemini_api_key_here
```

---

## 📦 Complete Installation & Setup

Follow these steps to set up the project locally:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/pjha91275/InvestEase-AI.git
   cd InvestEase-AI
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   * Duplicate `.env.example` and rename it to `.env`:
     ```bash
     cp .env.example .env
     ```
   * Open `.env` and fill in your keys (e.g. MongoDB URI and Gemini API Key).

4. **Launch Local MongoDB Instance:**
   * Ensure you have MongoDB running locally on port 27017:
     ```bash
     # (Default path: mongodb://127.0.0.1:27017/investease)
     mongod
     ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   * Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to view the application.

6. **Seed Initial Demo Data:**
   * Go to the Login Page at `/login`.
   * Click **"Launch Instantly with Demo Account"** to automatically create the `demo@investease.ai` user and populate 6 months of historical budgets, goals, transactions, and swept micro-investments.

7. **Verify OCR Engine Locally (Optional):**
   * Run the regex parser diagnostic harness script:
     ```bash
     node scratch/test_scan.js
     ```

---

## 🚶 Recommended Demo & Testing Script

To review the primary features of the platform step-by-step:

1. **Overview Dashboard**: Highlight the CRED-style dark-mode widgets at `/dashboard`.
2. **Ledger & OCR Scanner**: Click **Scan Receipt** at `/expenses`. Upload an invoice to trigger auto-fields.
3. **Roundup Sweeps**: Log a fractional cost transaction (e.g., ₹324.15 at Zomato). Dynamic categorization pre-selects **Food**, and ₹0.85 is automatically swept.
4. **Simulate Market Returns**: Navigate to `/portfolio`. Adjust sliders to rebalance targets and click **Simulate Market Movement** to trigger drift variance notifications.
5. **Timeline Growth**: Go to `/analytics` to view the compounding timeline growth charts.

---

## 👩‍⚖️ Judge FAQs with Answers

* **Q: How does the roundup sweep execute?**
  * Intercepted inside the expense post route. It calculates `Math.ceil(amount) - amount`, increments allocations balances, and inserts an investment sweep log.
* **Q: What if the Gemini Key is missing?**
  * Redirects queries silently to `getLocalAdvisorResponse` in `src/app/api/chat/route.ts` matching budget and savings keywords for high-fidelity responses.
* **Q: How is the Financial Health Score calculated?**
  * Checks savings margins, overspent budget ratios, necessity weights, emergency fund milestones, and rebalancing diversification to output a score (0-100).
* **Q: Why is OCR client-side?**
  * Tesseract.js processes images in the browser to avoid server load bottlenecks and Vercel timeout execution limit flags.
* **Q: How realistic is the Portfolio Simulator return rates model?**
  * We implement a drift model inspired by Geometric Brownian Motion. Each asset class drifts based on its real-world volatility (Stocks and Crypto experience wider swings, while Gold and Index Funds remain steady) for a realistic educational environment.

---

## 🔮 Future Scope

1. **UPI/Debit Card SMS Scraper**: Mobile app companion reading transaction alerts to automate roundups without manual tracking.
2. **Real Investment Broker integrations**: Connect roundups to mutual fund SIPs, purchasing fractional digital gold, or index baskets on every checkout sweep.
3. **Multi-User Family Pools**: Allow partners or families to combine their spare changes to build joint emergency pots.
