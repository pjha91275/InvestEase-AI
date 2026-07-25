# InvestEase AI 🚀
### Every Rupee Counts. Every Round-Up Builds Your Future.

**InvestEase AI** is a premium, national-hackathon-winning financial wellness platform designed to solve a universal consumer problem: people spend money daily without realizing how minor, unused fractions (change margins) can build compounding wealth over time. 

Instead of another static expense logging CRUD app, **InvestEase AI** automatically captures spare changes on transaction clearances, allocates them according to custom asset distributions, and sweeps them into a virtual portfolio simulator. It is packed with browser-based OCR receipt scanning, dynamic Recharts visualizations, a financial health scoring engine, and a fallback AI Spending Coach.

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

## 📁 Folder Structure

```
InvestEase AI/
├── src/
│   ├── app/                          # Client layout pages and Serverless API endpoints
│   ├── components/                   # Theme provider, Sidebar, and Tesseract canvas widgets
│   ├── lib/                          # Database connection and financial rules calculation engine
├── public/                           # Vector icons and site assets
├── package.json                      # Project dependencies
└── README.md                         # Hackathon Documentation
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

---

## ⚙️ Environment Variables

Create `.env` in root:
```ini
MONGODB_URI=mongodb://127.0.0.1:27017/investease
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=investease-ai-secret-key-987654321
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📦 Installation & Setup

1. **Install Modules:** `npm install`
2. **Start MongoDB:** Local daemon on port 27017 or MongoDB Atlas URI.
3. **Run Dev Server:** `npm run dev`
4. **Instant Seeding:** Click **"Launch Instantly with Demo Account"** at `/login` to auto-populate history.
5. **OCR Diagnostics:** Run `node scratch/test_scan.js` to verify offline parser regex rules locally.

---

## 🚶 Demo Script

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
