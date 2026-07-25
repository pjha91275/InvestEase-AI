'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, 
  TrendingUp, 
  Wallet, 
  Coins, 
  Percent, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity, 
  Sparkles, 
  RefreshCw,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

interface PortfolioData {
  portfolio: {
    allocations: {
      indexFunds: number;
      mutualFunds: number;
      stocks: number;
      gold: number;
      crypto: number;
    };
    balances: {
      indexFunds: number;
      mutualFunds: number;
      stocks: number;
      gold: number;
      crypto: number;
    };
    totalInvested: number;
    currentValue: number;
  };
  stats: {
    today: number;
    weekly: number;
    monthly: number;
    lifetime: number;
  };
  investments: any[];
  roundupsList: any[];
  growthTimeline: any[];
}

export default function PortfolioSimulator() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingAllocations, setUpdatingAllocations] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Allocation Sliders State
  const [indexAlloc, setIndexAlloc] = useState(40);
  const [mutualAlloc, setMutualAlloc] = useState(20);
  const [stocksAlloc, setStocksAlloc] = useState(20);
  const [goldAlloc, setGoldAlloc] = useState(10);
  const [cryptoAlloc, setCryptoAlloc] = useState(10);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/portfolio');
      if (res.ok) {
        const payload: PortfolioData = await res.json();
        setData(payload);
        if (payload.portfolio) {
          setIndexAlloc(payload.portfolio.allocations.indexFunds);
          setMutualAlloc(payload.portfolio.allocations.mutualFunds);
          setStocksAlloc(payload.portfolio.allocations.stocks);
          setGoldAlloc(payload.portfolio.allocations.gold);
          setCryptoAlloc(payload.portfolio.allocations.crypto);
        }
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchPortfolio();
    }
  }, [status, router]);

  const handleUpdateAllocations = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const sum = indexAlloc + mutualAlloc + stocksAlloc + goldAlloc + cryptoAlloc;
    if (sum !== 100) {
      setErrorMsg(`Allocations sum up to ${sum}%. They must equal exactly 100%.`);
      return;
    }

    setUpdatingAllocations(true);
    try {
      const res = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocations: {
            indexFunds: indexAlloc,
            mutualFunds: mutualAlloc,
            stocks: stocksAlloc,
            gold: goldAlloc,
            crypto: cryptoAlloc,
          }
        }),
      });
      const resJson = await res.json();
      if (res.ok) {
        setSuccessMsg('Investment allocations updated successfully.');
        fetchPortfolio();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        throw new Error(resJson.error || 'Failed to update allocations');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setUpdatingAllocations(false);
    }
  };

  const handleSimulateMarket = async () => {
    setSimulating(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/portfolio/simulate', { method: 'POST' });
      const resJson = await res.json();
      if (res.ok) {
        const changePercent = resJson.diffPercent;
        const direction = changePercent >= 0 ? 'grew by +' : 'slipped by';
        setSuccessMsg(`Market drift applied. Portfolio ${direction} ${Math.abs(changePercent)}%!`);
        fetchPortfolio();
        setTimeout(() => setSuccessMsg(''), 5000);
      } else {
        throw new Error(resJson.error || 'Simulation failed');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSimulating(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <span className="text-sm font-medium text-text-secondary">Loading Portfolio Simulator...</span>
      </div>
    );
  }

  if (!data) return null;

  const totalAllocations = indexAlloc + mutualAlloc + stocksAlloc + goldAlloc + cryptoAlloc;
  const isAllocationsValid = totalAllocations === 100;

  const pieData = [
    { name: 'Index Funds', value: data.portfolio.balances.indexFunds, alloc: data.portfolio.allocations.indexFunds },
    { name: 'Mutual Funds', value: data.portfolio.balances.mutualFunds, alloc: data.portfolio.allocations.mutualFunds },
    { name: 'Stocks', value: data.portfolio.balances.stocks, alloc: data.portfolio.allocations.stocks },
    { name: 'Gold', value: data.portfolio.balances.gold, alloc: data.portfolio.allocations.gold },
    { name: 'Crypto', value: data.portfolio.balances.crypto, alloc: data.portfolio.allocations.crypto },
  ].filter(entry => entry.value > 0 || entry.alloc > 0);

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  const statsCards = [
    { title: 'Today Roundups', amount: `₹${data.stats.today.toFixed(2)}`, desc: 'Today sweeps' },
    { title: 'Weekly Saved', amount: `₹${data.stats.weekly.toFixed(2)}`, desc: 'Last 7 days' },
    { title: 'Monthly Swipes', amount: `₹${data.stats.monthly.toFixed(2)}`, desc: 'Current month' },
    { title: 'Lifetime Savings', amount: `₹${data.stats.lifetime.toFixed(2)}`, desc: 'Accumulated round-ups' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[36px] font-bold text-text-primary tracking-tight leading-tight">
            Portfolio Simulator
          </h1>
          <p className="text-sm text-text-secondary font-medium mt-1">
            Invest round-up spare changes into a virtual portfolio, simulate returns, and customize asset splits.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button 
            onClick={handleSimulateMarket} 
            disabled={simulating}
            className="flex items-center gap-1.5 font-semibold py-2 px-4 text-xs shrink-0"
          >
            {simulating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span>Simulate Market Movement</span>
          </Button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl border border-accent-success/20 bg-accent-success/5 text-accent-success flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4.5 w-4.5 text-accent-success" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl border border-accent-danger/20 bg-accent-danger/5 text-accent-danger flex items-center gap-2 text-sm font-semibold">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Roundup Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, idx) => (
          <Card key={idx} className="p-6 transition-all duration-150 hover:-translate-y-0.5">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">{card.title}</span>
            <div className="text-xl sm:text-2xl font-bold text-text-primary mt-1 tracking-tight">{card.amount}</div>
            <span className="text-[11px] text-text-secondary font-medium block mt-0.5">{card.desc}</span>
          </Card>
        ))}
      </div>

      {/* Portfolio Value Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-card-sec/20 border border-border-color/60 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-text-secondary uppercase">Total Invested (Roundups)</span>
            <div className="text-3xl font-extrabold text-text-primary mt-2 tracking-tight">
              ₹{data.portfolio.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <span className="text-[10px] text-text-secondary font-semibold mt-3">Lifetime round-up Sweeps</span>
        </Card>

        <Card className="p-6 bg-card-sec/20 border border-border-color/60 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-text-secondary uppercase">Current Value</span>
            <div className="text-3xl font-extrabold text-text-primary mt-2 tracking-tight">
              ₹{data.portfolio.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            {data.portfolio.currentValue >= data.portfolio.totalInvested ? (
              <>
                <ArrowUpRight className="h-4.5 w-4.5 text-accent-success" />
                <span className="text-xs font-bold text-accent-success">
                  +₹{(data.portfolio.currentValue - data.portfolio.totalInvested).toFixed(2)}
                </span>
                <span className="text-[10px] font-medium text-text-secondary">returns</span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-4.5 w-4.5 text-accent-danger" />
                <span className="text-xs font-bold text-accent-danger">
                  -₹{Math.abs(data.portfolio.currentValue - data.portfolio.totalInvested).toFixed(2)}
                </span>
                <span className="text-[10px] font-medium text-text-secondary">returns</span>
              </>
            )}
          </div>
        </Card>

        <Card className="p-6 bg-card-sec/20 border border-border-color/60 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-text-secondary uppercase">Asset Allocation Split</span>
            <div className="flex flex-wrap gap-2 mt-3">
              {Object.entries(data.portfolio.allocations).map(([key, val]) => (
                <div key={key} className="text-[10px] bg-card-sec border border-border-color px-2.5 py-0.5 rounded-full font-bold text-text-primary uppercase">
                  {key.replace('Funds', '')}: {val}%
                </div>
              ))}
            </div>
          </div>
          <span className="text-[10px] text-text-secondary font-semibold mt-3">Round-ups distribution rule</span>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Growth Timeline Chart (Width 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Financial Growth Timeline</CardTitle>
              <CardDescription>Simulated asset values compound vs roundups contributions</CardDescription>
            </CardHeader>
            <CardContent className="h-80 pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.growthTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRoundups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748B" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#64748B" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(var(--border-color-rgb), 0.15)" />
                  <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    formatter={(value) => `₹${value}`}
                    contentStyle={{ 
                      backgroundColor: 'var(--card)', 
                      borderColor: 'var(--border-color)', 
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area name="Portfolio Value (₹)" type="monotone" dataKey="investment" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorInvestment)" />
                  <Area name="Round-up Savings (₹)" type="monotone" dataKey="roundups" stroke="#64748B" strokeWidth={2} fillOpacity={1} fill="url(#colorRoundups)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Allocation sliders form */}
          <Card>
            <CardHeader>
              <CardTitle>Adjust Allocations</CardTitle>
              <CardDescription>Allocate how your transaction round-ups are distributed (Sum must equal 100%)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateAllocations} className="space-y-6">
                <div className="space-y-4">
                  {/* Slider 1: Index */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-text-primary flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0" />
                        Index Funds
                      </span>
                      <span className="text-accent-primary">{indexAlloc}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={indexAlloc}
                      onChange={(e) => setIndexAlloc(Number(e.target.value))}
                      className="w-full accent-accent-primary h-1 bg-card-sec rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Mutual */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-text-primary flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                        Mutual Funds
                      </span>
                      <span className="text-accent-success">{mutualAlloc}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={mutualAlloc}
                      onChange={(e) => setMutualAlloc(Number(e.target.value))}
                      className="w-full accent-accent-success h-1 bg-card-sec rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Slider 3: Stocks */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-text-primary flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                        Stocks
                      </span>
                      <span className="text-accent-warning">{stocksAlloc}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={stocksAlloc}
                      onChange={(e) => setStocksAlloc(Number(e.target.value))}
                      className="w-full accent-accent-warning h-1 bg-card-sec rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Slider 4: Gold */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-text-primary flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-pink-500 shrink-0" />
                        Gold Assets
                      </span>
                      <span className="text-pink-500">{goldAlloc}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={goldAlloc}
                      onChange={(e) => setGoldAlloc(Number(e.target.value))}
                      className="w-full accent-pink-500 h-1 bg-card-sec rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Slider 5: Crypto */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm font-semibold">
                      <span className="text-text-primary flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                        Crypto Assets
                      </span>
                      <span className="text-purple-500">{cryptoAlloc}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" step="5"
                      value={cryptoAlloc}
                      onChange={(e) => setCryptoAlloc(Number(e.target.value))}
                      className="w-full accent-purple-500 h-1 bg-card-sec rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-secondary">Sum Total:</span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isAllocationsValid ? 'bg-accent-success/15 text-accent-success' : 'bg-accent-danger/15 text-accent-danger'}`}>
                      {totalAllocations}%
                    </span>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={updatingAllocations || !isAllocationsValid}
                    className="px-6 font-semibold"
                  >
                    {updatingAllocations ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Allocations'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Asset balance lists (Width 1/3) */}
        <div className="space-y-8">
          {/* Balance Pie chart representation */}
          <Card className="flex flex-col items-center justify-center p-6 min-h-[280px]">
            <span className="text-xs font-bold text-text-secondary uppercase self-start mb-4">Allocation Chart</span>
            {pieData.length > 0 ? (
              <div className="w-full h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                  <span className="text-[10px] text-text-secondary font-bold uppercase">Valuation</span>
                  <span className="text-sm font-extrabold text-text-primary">
                    ₹{data.portfolio.currentValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-text-secondary py-12">
                No active asset holdings. Auto round-ups from expenses will populate values.
              </div>
            )}
          </Card>

          {/* Holdings balances lists */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Asset Holdings</CardTitle>
              <CardDescription>Current values of individual asset accounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Index Funds', key: 'indexFunds', color: 'bg-blue-600', icon: Wallet },
                { name: 'Mutual Funds', key: 'mutualFunds', color: 'bg-emerald-500', icon: Activity },
                { name: 'Stocks', key: 'stocks', color: 'bg-amber-500', icon: TrendingUp },
                { name: 'Gold', key: 'gold', color: 'bg-pink-500', icon: Coins },
                { name: 'Crypto', key: 'crypto', color: 'bg-purple-500', icon: Percent },
              ].map((asset, idx) => {
                const bal = (data.portfolio.balances as any)[asset.key] || 0;
                const pct = (data.portfolio.allocations as any)[asset.key] || 0;
                const Icon = asset.icon;
                return (
                  <div key={idx} className="flex justify-between items-center gap-3 p-3 bg-card-sec rounded-xl border border-border-color text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg text-white ${asset.color}`}>
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-text-primary">{asset.name}</h5>
                        <span className="block text-[9px] text-text-secondary mt-0.5">{pct}% allocation rules</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-text-primary">₹{bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Recent Sweeps log */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Recent Sweeps</CardTitle>
              <CardDescription>Latest investment deposit logs</CardDescription>
            </CardHeader>
            <CardContent className="divide-y divide-border-color max-h-56 overflow-y-auto pr-1">
              {data.investments.length > 0 ? (
                data.investments.map((inv, idx) => (
                  <div key={idx} className="py-2.5 flex justify-between items-center gap-4 text-xs font-semibold">
                    <div>
                      <h4 className="font-semibold text-text-primary truncate max-w-[130px]">{inv.description}</h4>
                      <span className="text-[10px] text-text-secondary block font-medium mt-0.5">
                        {new Date(inv.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-accent-success">+₹{inv.amount.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-text-secondary py-6 text-xs font-medium">
                  No roundup sweeps logged yet. Add fractional expenses to trigger sweeps.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
