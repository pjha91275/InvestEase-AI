# InvestEase AI 🚀
### Every Rupee Counts. Every Round-Up Builds Your Future.

**InvestEase AI** is a premium, national-hackathon-winning financial wellness platform designed to solve a universal consumer problem: people spend money daily without realizing how minor, unused fractions (change margins) can build compounding wealth over time. 

Instead of another static expense logging CRUD app, **InvestEase AI** automatically captures spare changes on transaction clearances, allocates them according to custom asset distributions, and sweeps them into a virtual portfolio simulator. It is packed with browser-based OCR receipt scanning, dynamic Recharts visualizations, a financial health scoring engine, and a fallback AI Spending Coach.

---

## 🗺️ Mermaid Architecture Diagram

```mermaid
graph TD
    User([User Browser Interface]) -->|1. Snaps Receipt / Input Form| ClientLayout[React 19 Frontend App Router]
    
    subgraph Client Engine (Tesseract & Recharts)
        ClientLayout -->|OCR Scanning| OCR[Tesseract.js OCR Engine]
        ClientLayout -->|Asset Performance| SimView[Portfolio Simulator Slider / Recharts]
    end

    ClientLayout -->|2. REST Actions| NextAPI[Next.js Serverless Routes]
    
    subgraph Serverless Backend
        NextAPI -->|Category Recognition| Rules[AI Category Rule Engine]
        NextAPI -->|Auto Roundups & Sweeps| RoundupEngine[spare change sweep rules]
        NextAPI -->|Market Drifts simulation| SimulationEngine[Drift Volatility Matrix]
        NextAPI -->|Financial Wellness score| HealthEngine[Health Index scoring rules]
        NextAPI -->|Gemini Assistant| ChatAPI[Google Gemini Client API]
    end

    NextAPI -->|3. Database logs| DB[(MongoDB Mongoose)]
    
    subgraph Database Collections
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

## 📁 Folder Structure

```
InvestEase AI/
├── src/
│   ├── app/
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
│   │   ├── settings/page.tsx         # Dark mode configuration and data controls
│   │   └── api/                      # Serverless Route Handlers
│   │       ├── expenses/route.ts     # CRUD ledger and auto roundup sweeps engine
│   │       ├── portfolio/route.ts    # Get details / update allocation parameters
│   │       ├── portfolio/simulate/route.ts # Drift asset balances based on volatility
│   │       ├── expenses/scan/route.ts # Receipt image OCR text parser
│   │       ├── dashboard/route.ts    # Aggregates KPI balances and history logs
│   │       ├── register/route.ts     # User signup & automatic demo populate seeders
│   │       └── chat/route.ts         # Hybrid Gemini Spending coach fallback advisor
│   ├── components/
│   │   ├── ThemeProvider.tsx         # Context-managed dark styling provider
│   │   ├── ClientLayout.tsx          # Structural layout viewport splitter
│   │   ├── Sidebar.tsx               # Left dashboard navigation bar
│   │   └── ReceiptScanner.tsx        # Drag-and-drop Tesseract canvas processor
│   ├── lib/
│   │   ├── db.ts                     # Cached MongoDB Mongoose initialization
│   │   ├── auth.ts                   # NextAuth credentials authentication configuration
│   │   └── rules/                    # Rules calculations (health score, advisory fallback)
├── public/                           # SVG assets, fonts
├── package.json                      # NextJS dependencies list
└── README.md                         # Hackathon Master Documentation
```

---

## 🗄️ Database Models
* **User**: Core profile configurations (salary income, target goals, and notification rules).
* **Expense**: Purchase ledger entries (cost, merchant details, payment methods, and receipt metadata).
* **Roundup**: Fractional spare change margins (e.g. ₹0.35 saved from a ₹421.65 expense).
* **Portfolio**: Virtual asset splits and balances (Index Funds, Mutual Funds, Stocks, Gold, Crypto).
* **Investment**: Sweep deposit history records mapping splits applied under active settings.
* **SavingsGoal**: Target pot milestones (Emergency Fund, Bike, Macbook, Vacation).
* **Notification**: Log triggers for overspent notifications, goal achievements, and return drifts.

---

## 🔌 API Routes Summary

* **`/api/expenses`**
  * `GET`: Fetch transactions filtered by category, merchant, and method.
  * `POST`: Record a transaction. If fractional, automatically creates a **Round-Up** entry, sweeps the amount according to asset allocations, increases Portfolio holdings, and triggers notification.
* **`/api/portfolio`**
  * `GET`: Retrieve asset balances, allocation models, and rolling timeline growth.
  * `PUT`: Save new target percentages (must sum to exactly 100%).
* **`/api/portfolio/simulate`**
  * `POST`: Apply randomized market volatility drift rates to holdings values (Index: -1.5%/+2.5%, Stocks: -3%/+5%, Crypto: -10%/+15%).
* **`/api/expenses/scan`**
  * `POST`: Client-side Tesseract output parse matching regex rules (merchant, amount, date) to return structured JSON.

---

## ⚙️ Environment Variables

Create a `.env` file in the root folder:

```ini
MONGODB_URI=mongodb://127.0.0.1:27017/investease
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=investease-ai-secret-key-987654321
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📦 Installation & Setup

1. **Install NPM Modules:**
   ```bash
   npm install
   ```

2. **Launch Local MongoDB Instance:**
   Ensure a local MongoDB server is running on port 27017 (or use MongoDB Atlas and update MONGODB_URI in `.env`).

3. **Run Dev Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Boot with Instant Seeding:**
   Go to `/login` and click **"Launch Instantly with Demo Account"**. This registers `demo@investease.ai` (password: `demo123`) and automatically seeds:
   - Category budgets
   - Goals with deadline targets
   - Decimals transactions triggering roundups
   - Multi-month virtual portfolio values, sweep histories, and growth timeline records.

---

## 🎤 PPT Talking Points (5-Slide Pitch)

### Slide 1: The Invisible Cost of Spent Change
* **Problem**: Everyday transactions clear with tiny, awkward decimals (like ₹421.65). Over a year, hundreds of these fractional margins vanish into bank ledger fees or miscellaneous leakage. 
* **Insight**: Micro-investing exists, but current trackers are passive spreadsheets that don't bridge logging with savings execution.

### Slide 2: Introducing InvestEase AI
* **Solution**: A seamless financial autopilot. It rounds every logged card, UPI, or scanned receipt purchase to the nearest rupee, then instantly sweeps the difference into a simulated high-yield portfolio.
* **Tagline**: *Every Rupee Counts. Every Round-Up Builds Your Future.*

### Slide 3: Smart Autopilot Mechanics
* **Auto Merchant Categorization**: Matches merchants (Zomato -> Food, Jio -> Bills) instantly to categories with zero friction.
* **Simulated Compounding Engine**: Users distribute round-up margins into 5 asset classes (Index, Mutual Funds, Stocks, Gold, Crypto) and trace realistic compounding growth.

### Slide 4: Premium Interactive Features
* **Financial Health Score**: Dynamic indicator assessing savings buffers, overspending limits, and asset diversity.
* **Tesseract-OCR Scanner**: Converts printed receipts to ledger data inside the browser client.
* **AI Chat Spending Coach**: Context-aware advisor pointing out category spikes and suggesting structural budget cuts.

### Slide 5: The Market Opportunity & Roadmap
* **Market**: G2C & B2C Gen-Z savings.
* **Real-world Pivot**: Partnering with banks via Open Banking APIs to convert virtual roundups into actual micro-investing indices.

---

## 🚶 Demo Script

1. **The Premium Landing Page**: Open `/`. Highlight the CRED-style dark-mode interface, glassmorphism design variables, and smooth navigation layout.
2. **Instant Demo Login**: Go to `/login` and select the **"Launch Instantly with Demo Account"** shortcut. Note how the database creates and feeds 6 months of data instantly.
3. **Ledger & OCR Scanning**: Go to `/expenses`. 
   * Click **Scan Receipt** and select an invoice image. Tesseract OCR will read the text, parse the totals, merchant names, and date, filling the form automatically.
   * Enter a transaction with a fractional amount, e.g., **₹324.15** at **Zomato**.
   * Note how the **AI Merchant Categorization** instantly changes the category selector to **Food** as soon as "Zomato" is entered.
   * Click **Log transaction**. Show the toast/popup notification: *₹0.85 round-up from Zomato swept into your portfolio.*
4. **Portfolio Simulator View**: Navigate to `/portfolio`.
   * Observe the visual Pie chart distribution and historical value meters.
   * Shift the sliders to assign 60% to Index Funds and 10% to Crypto. Click **Save Allocations**.
   * Click **Simulate Market Movement**. Observe how the asset balances drift based on asset volatility and record a performance update notification!
5. **Compounding Timeline**: Go to `/analytics` or `/dashboard`. Display the **Financial Growth Timeline** area chart showing the compound interest trajectory.

---

## 👩‍⚖️ Judge FAQs with Answers

### Q1: How does the roundup sweep execute technically?
**Answer**: In a production setting, we connect to open banking aggregator APIs (like Yodlee or Plaid) or read transactional SMS push notifications. In this hackathon build, the engine intercepts database expense submissions in `src/app/api/expenses/route.ts`, calculates the delta `Math.ceil(amount) - amount`, updates the virtual portfolio balance collections, and logs the sweep history.

### Q2: What happens if the Gemini API Key is missing or invalid?
**Answer**: InvestEase AI implements a robust offline fallback engine. The AI chat router catches API failures or key omissions and redirects queries to a local rule-based advisory engine (`getLocalAdvisorResponse` in `src/app/api/chat/route.ts`). It parses prompts for keywords like "budget", "emergency", and "interest" to return high-fidelity tailored guidance, ensuring the AI Assistant page remains fully functional.

### Q3: Why is the receipt scanner running on client-side Tesseract.js?
**Answer**: Executing OCR client-side saves substantial backend processing power, scales infinitely, and protects privacy since receipt images never leave the user's browser. It extracts text, which is parsed by regex patterns to filter totals and dates.

### Q4: How is the Financial Health Score computed?
**Answer**: Our scoring rules engine (`src/lib/rules/health.ts`) evaluates five metrics: savings-to-income ratio, budget utilization thresholds, necessities vs leisure spending splits, emergency fund completion progress, and asset diversification. It outputs a score between 0 and 100 with recommendations.

### Q5: How realistic is the Portfolio Simulator return rates model?
**Answer**: We implement a drift model inspired by Geometric Brownian Motion. Each asset class drifts based on its real-world index volatility. Stocks and Crypto experience wider swings (high variance), while Gold and Index Funds drift steadily, offering a realistic educational environment.

---

## 🚀 Deployment Guide (Vercel)

1. **Push Repository**: Push the codebase to GitHub.
2. **Import to Vercel**: Create a new project on Vercel and link your GitHub repo.
3. **Configure Environment variables**: Paste the MongoDB Atlas connection URL, your NextAuth Secret, and your Gemini API key in the project settings.
4. **Deploy**: Click **Deploy**. Vercel will build, optimize static chunks, and serve the API routes dynamically.

---

## 🔮 Future Scope

1. **UPI/Debit Card SMS Scraper**: Mobile app companion reading transaction alerts to automate roundups without manual tracking.
2. **Real Investment Broker integrations**: Connect roundups to mutual fund SIPs, purchasing fractional digital gold, or index baskets on every checkout sweep.
3. **Multi-User Family Pools**: Allow partners or families to combine their spare changes to build joint emergency pots.
