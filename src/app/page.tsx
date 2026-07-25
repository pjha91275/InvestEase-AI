'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  TrendingUp,
  Activity,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Play,
  Lock,
  ChevronDown,
  Mail,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = React.useState<number | null>(null);

  const features = [
    {
      icon: Camera,
      title: 'Tesseract OCR Receipt Scanner',
      desc: 'Scan receipts instantly. Our client-side OCR reads items, dates, and prices directly in your browser, keeping your documents private.',
    },
    {
      icon: TrendingUp,
      title: 'Expense & Savings Tracker',
      desc: 'Seamlessly add, audit, and categorize daily payments. Auto-apportion with savings goal milestones.',
    },
    {
      icon: Activity,
      title: 'Financial Health Gauge',
      desc: 'Compute a normalized index from 0 to 100 assessing savings rates, budget overruns, and volatility.',
    },
    {
      icon: Sparkles,
      title: 'Hybrid AI Assistant',
      desc: 'Powered by Google Gemini for tailored insights and custom queries, with local offline fallback guides.',
    },
  ];

  const steps = [
    { number: '01', title: 'Create Account', desc: 'Secure register in under 30 seconds.' },
    { number: '02', title: 'Configure Profile', desc: 'Input your income and set savings goals.' },
    { number: '03', title: 'Scan Receipts', desc: 'Upload images of bills or input transactions manually.' },
    { number: '04', title: 'Get Insights', desc: 'Receive real-time alerts and AI guidance.' },
  ];

  const testimonials = [
    {
      quote: "InvestEase AI scanned my restaurant bill and parsed the categories perfectly. The dashboard analytics make it so easy to budget my expenses!",
      author: "Marcus Vance",
      role: "SaaS Engineer"
    },
    {
      quote: "I love the hybrid AI advisor. If I'm offline, the local advice keeps my spending checks active. The dashboard UI is clean and feels premium.",
      author: "Helena Rostova",
      role: "Creative Director"
    }
  ];

  const faqs = [
    {
      q: "Is my transaction information shared with Gemini?",
      a: "No. Your transactions remain safely isolated inside MongoDB. The Gemini chat system only parses the prompts you explicitly write in the chat bar."
    },
    {
      q: "How does the receipt scanner work?",
      a: "Tesseract.js runs directly in your browser. It extracts the raw text from your receipt image client-side, and then calls Gemini to map dates, amounts, and merchant details into structured transaction logs."
    },
    {
      q: "Can I use the app if the Gemini API key is missing?",
      a: "Yes. The platform operates completely offline. If the Gemini API is down, a local financial advisor template yields personalized recommendations based on your spending distribution."
    }
  ];

  return (
    <div className="relative overflow-hidden bg-background min-h-screen transition-colors duration-200">
      {/* Subtle Background Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-accent-primary/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 text-center">
        <h1 className="text-4xl sm:text-[56px] font-bold tracking-tight text-text-primary max-w-4xl mx-auto leading-[1.1] sm:leading-[1.15]">
          Know Where Every Rupee Goes.<br />
          <span className="text-gradient-emerald">Scan Receipts. Optimize Your Expenses.</span>
        </h1>
        
        <p className="mt-6 text-base sm:text-[18px] text-text-secondary max-w-2xl mx-auto leading-relaxed font-medium">
          A secure, privacy-first platform that tracks expenses, scans bills using OCR, and sets smart budgets.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="flex items-center gap-2 font-medium">
              Start Free Trial <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="flex items-center gap-2 font-medium">
              <Play className="h-3 w-3 fill-current text-text-secondary" /> Demo Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Highlights List */}
      <section className="max-w-4xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-card border border-border-color rounded-[20px] shadow-sm">
          {[
            '✓ OCR Receipt Scanner',
            '✓ AI Financial Advisor',
            '✓ Smart Budget Planner',
            '✓ Privacy First'
          ].map((item, idx) => (
            <div key={idx} className="flex justify-center items-center text-sm font-semibold text-text-primary text-center">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 lg:px-8 py-16 border-t border-border-color">
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[36px]">
            Designed for Clarity and Financial Guardrails
          </h2>
          <p className="mt-4 text-sm text-text-secondary font-medium">
            We merge standard deterministic financial rules with LLM analysis and client-side OCR for top-tier capability.
          </p>
        </div>

        {/* Asymmetrical feature grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card 
                key={idx} 
                className="transition-all duration-150 hover:-translate-y-0.5"
              >
                <div className="text-accent-primary mb-4">
                  <Icon className="h-5 w-5 stroke-[1.5]" />
                </div>
                <h3 className="text-[18px] font-semibold text-text-primary mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="bg-card border border-border-color rounded-[20px] p-8 sm:p-12 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[36px] leading-tight">
              Why Choose InvestEase AI Over Generic Trackers?
            </h2>
            <p className="mt-4 text-sm text-text-secondary leading-relaxed font-medium">
              Most expense apps require manual input for every transaction. InvestEase AI lets you snap receipts to scan details instantly, maps your financial health score, and flags suspicious transactions.
            </p>
            <ul className="mt-6 space-y-3">
              {['100% Privacy - your bank secrets stay local', 'Client-side OCR processing for maximum speed', 'Clean UI inspired by Stripe and Linear'].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-sm font-medium text-text-primary">
                  <CheckCircle className="h-4.5 w-4.5 text-accent-success shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-64 sm:h-80 rounded-2xl bg-card-sec border border-border-color overflow-hidden flex items-center justify-center p-6">
            {/* Mock Dashboard Widget */}
            <div className="w-full max-w-sm bg-card rounded-xl p-6 border border-border-color shadow-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">Monthly Budget</span>
                <span className="text-[10px] bg-accent-success/15 text-accent-success px-2.5 py-0.5 rounded-full font-bold">Good Standing</span>
              </div>
              <div className="text-2xl font-bold text-text-primary">₹34,200 / ₹45,000</div>
              <div className="w-full bg-card-sec h-2 rounded-full overflow-hidden mt-4">
                <div className="bg-accent-primary h-full w-[76%]" />
              </div>
              <div className="mt-4 text-[11px] font-medium text-text-secondary border-t border-border-color pt-3 flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-accent-primary" /> Budget in good standing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[36px]">
            Seamless Workflow Setup
          </h2>
          <p className="mt-3 text-sm text-text-secondary font-medium">
            Four simple phases to regain complete command of your spending.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center text-center group">
              <div className="text-4xl font-semibold text-accent-primary/10 mb-2">
                {step.number}
              </div>
              <h3 className="text-base font-semibold text-text-primary mb-2">{step.title}</h3>
              <p className="text-xs text-text-secondary font-medium leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, idx) => (
            <div key={idx} className="bg-card border border-border-color p-8 rounded-[20px] shadow-sm flex flex-col justify-between">
              <p className="text-sm italic text-text-primary font-medium leading-relaxed">
                "{t.quote}"
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-card-sec flex items-center justify-center font-bold text-text-secondary text-xs">
                  {t.author.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-text-primary">{t.author}</h4>
                  <p className="text-[10px] text-text-secondary">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 lg:px-8 py-16 text-center">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[36px]">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-3 text-sm text-text-secondary font-medium">
            All features are free during launch week.
          </p>
        </div>

        <div className="max-w-md mx-auto bg-card border border-accent-primary/20 rounded-[20px] p-8 shadow-md relative">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-accent-primary text-white text-[9px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
            Launch Offer
          </div>
          <h3 className="text-lg font-bold text-text-primary">Founder Tier</h3>
          <div className="mt-4 text-4xl font-extrabold text-text-primary">
            ₹0<span className="text-sm font-medium text-text-secondary">/mo</span>
          </div>
          <p className="mt-2 text-xs text-text-secondary font-bold">Free Forever for early adopters</p>
          <ul className="mt-6 space-y-4 text-left border-y border-border-color py-6">
            {[
              'Unlimited receipt scanning OCR',
              'Unlimited transaction additions',
              'Advanced 0-100 financial health scores',
              'Interactive Recharts analysis',
              'Google Gemini AI advisor integration',
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                <CheckCircle className="h-4.5 w-4.5 text-accent-success shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Link href="/register" className="block mt-8">
            <Button className="w-full py-2.5" size="lg">Get Started Now</Button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl sm:text-[36px] font-bold text-text-primary text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-card border border-border-color rounded-xl overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-text-primary hover:bg-card-sec/45 transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base pr-4">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-text-secondary shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="p-5 pt-0 border-t border-border-color text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-color py-12 mt-16 bg-card-sec/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-accent-primary rounded-lg text-white">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-text-primary">
              InvestEase <span className="text-accent-primary">AI</span>
            </span>
          </div>
          <p className="text-xs text-text-secondary font-medium">
            &copy; {new Date().getFullYear()} InvestEase AI. Handcrafted with premium specifications.
          </p>
          <div className="flex gap-4 text-text-secondary">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-text-primary transition-colors" aria-label="GitHub Repository">
              <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
