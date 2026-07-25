'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Plus,
  Search,
  Trash2,
  AlertTriangle,
  X,
  Camera,
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import ReceiptScanner from '@/components/ReceiptScanner';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  merchant: string;
  date: string;
  paymentMethod: string;
  notes?: string;
  isScanned?: boolean;
}

export default function ExpenseTracker() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [searchMerchant, setSearchMerchant] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('Food');
  const [formMerchant, setFormMerchant] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Credit Card');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [formNotes, setFormNotes] = useState('');
  const [formIsScanned, setFormIsScanned] = useState(false);
  const [formLoading, setFormLoading] = useState(false);



  const categories = [
    { value: 'Food', label: 'Food' },
    { value: 'Travel', label: 'Travel' },
    { value: 'Shopping', label: 'Shopping' },
    { value: 'Education', label: 'Education' },
    { value: 'Medical', label: 'Medical' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Bills', label: 'Bills' },
    { value: 'Others', label: 'Others' },
  ];

  const paymentMethods = [
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Debit Card', label: 'Debit Card' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Bank Transfer', label: 'Bank Transfer' },
  ];

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      let url = `/api/expenses?category=${filterCategory}&paymentMethod=${filterPayment}`;
      if (searchMerchant.trim() !== '') {
        url += `&merchant=${encodeURIComponent(searchMerchant)}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setExpenses(data);
      } else {
        throw new Error('Failed to load transactions');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchExpenses();
    }
  }, [status, router, filterCategory, filterPayment]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchExpenses();
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle || `Purchase at ${formMerchant}`,
          amount: parseFloat(formAmount),
          category: formCategory,
          merchant: formMerchant,
          paymentMethod: formPaymentMethod,
          date: formDate ? new Date(formDate).toISOString() : new Date().toISOString(),
          notes: formNotes,
          isScanned: formIsScanned,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to record expense');
      }



      // Reset Form State
      setFormTitle('');
      setFormAmount('');
      setFormCategory('Food');
      setFormMerchant('');
      setFormPaymentMethod('Credit Card');
      setFormDate(new Date().toISOString().slice(0, 10));
      setFormNotes('');
      setFormIsScanned(false);
      setShowAddForm(false);

      fetchExpenses();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      const res = await fetch(`/api/expenses?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchExpenses();
      } else {
        const d = await res.json();
        throw new Error(d.error || 'Failed to remove expense');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleScanComplete = (scanData: {
    merchant: string;
    amount: number;
    date: string;
    category: string;
    description: string;
  }) => {
    setFormMerchant(scanData.merchant);
    setFormAmount(scanData.amount > 0 ? scanData.amount.toString() : '');
    setFormCategory(scanData.category);
    setFormNotes(scanData.description);
    setFormTitle(`Scan: ${scanData.merchant}`);
    setFormIsScanned(true);

    if (scanData.date) {
      try {
        const d = new Date(scanData.date);
        if (!isNaN(d.getTime())) {
          const tzOffset = d.getTimezoneOffset() * 60 * 1000;
          const localTime = new Date(d.getTime() - tzOffset);
          setFormDate(localTime.toISOString().slice(0, 10));
        } else {
          setFormDate(new Date().toISOString().slice(0, 10));
        }
      } catch {
        setFormDate(new Date().toISOString().slice(0, 10));
      }
    } else {
      setFormDate(new Date().toISOString().slice(0, 10));
    }

    setShowAddForm(true);
    setShowScanner(false);
  };

  const autoCategorizeMerchant = (merchantName: string) => {
    const lower = merchantName.toLowerCase().trim();
    if (lower.includes('swiggy') || lower.includes('zomato') || lower.includes('starbucks') || lower.includes('restaurant') || lower.includes('food')) {
      setFormCategory('Food');
    } else if (lower.includes('uber') || lower.includes('ola') || lower.includes('irctc') || lower.includes('travel') || lower.includes('flight') || lower.includes('train') || lower.includes('metro') || lower.includes('cab')) {
      setFormCategory('Travel');
    } else if (lower.includes('amazon') || lower.includes('flipkart') || lower.includes('myntra') || lower.includes('shopping') || lower.includes('nike') || lower.includes('zara')) {
      setFormCategory('Shopping');
    } else if (lower.includes('blinkit') || lower.includes('grocery') || lower.includes('bigbasket') || lower.includes('instamart') || lower.includes('zepto')) {
      setFormCategory('Food');
    } else if (lower.includes('netflix') || lower.includes('spotify') || lower.includes('prime') || lower.includes('hotstar') || lower.includes('movie') || lower.includes('entertainment') || lower.includes('lounge')) {
      setFormCategory('Entertainment');
    } else if (lower.includes('jio') || lower.includes('airtel') || lower.includes('bills') || lower.includes('electricity') || lower.includes('power') || lower.includes('water') || lower.includes('utility')) {
      setFormCategory('Bills');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-[36px] font-bold tracking-tight text-text-primary">
            Expense Tracker
          </h1>
          <p className="text-sm text-text-secondary font-medium mt-1">
            Maintain, check, and filter your daily expenditures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => {
              setShowScanner(!showScanner);
              setShowAddForm(false);
            }} 
            variant="outline"
            size="sm" 
            className="flex items-center gap-1.5 font-semibold text-accent-primary border-accent-primary/20 hover:bg-accent-primary/5"
          >
            <Camera className="h-4.5 w-4.5" />
            <span>Scan Receipt</span>
          </Button>
          <Button 
            onClick={() => {
              setShowAddForm(!showAddForm);
              setShowScanner(false);
              setFormIsScanned(false);
              setFormDate(new Date().toISOString().slice(0, 10));
            }} 
            size="sm" 
            className="flex items-center gap-1.5 font-semibold"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>New Transaction</span>
          </Button>
        </div>
      </div>

      {/* Tesseract OCR Receipt Scanner Panel */}
      {showScanner && (
        <ReceiptScanner
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      )}



      {/* Add Expense Form Box */}
      {showAddForm && (
        <Card className="border border-accent-primary/20">
          <CardHeader className="flex flex-row justify-between items-center mb-4">
            <div>
              <CardTitle>Log Transaction {formIsScanned && <span className="text-xs text-accent-success font-bold bg-accent-success/15 px-2.5 py-0.5 rounded-full ml-2 lowercase">scanned</span>}</CardTitle>
              <CardDescription>Register a new purchase into database records</CardDescription>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-lg text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddExpense} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Transaction Title"
                placeholder="e.g. Swiggy Lunch"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                disabled={formLoading}
              />
              <Input
                label="Amount (₹)"
                type="number"
                step="0.01"
                placeholder="e.g. 450"
                required
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                disabled={formLoading}
              />
              <Select
                label="Category"
                options={categories}
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                disabled={formLoading}
              />
              <Input
                label="Merchant Name"
                placeholder="e.g. Swiggy"
                required
                value={formMerchant}
                onChange={(e) => {
                  setFormMerchant(e.target.value);
                  autoCategorizeMerchant(e.target.value);
                }}
                disabled={formLoading}
              />
              <Select
                label="Payment Method"
                options={paymentMethods}
                value={formPaymentMethod}
                onChange={(e) => setFormPaymentMethod(e.target.value)}
                disabled={formLoading}
              />
              <Input
                label="Transaction Date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                disabled={formLoading}
              />
              <div className="col-span-1 md:col-span-2">
                <Input
                  label="Notes / Comments"
                  placeholder="Add context notes..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  disabled={formLoading}
                />
              </div>
              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="px-6">
                  {formLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : 'Record Expense'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filter Options box */}
      <Card className="p-6">
        <CardContent className="p-0">
          <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-end gap-4">
            <div className="flex-grow w-full">
              <Input
                label="Search Merchant"
                placeholder="e.g. Zomato, Uber, Amazon..."
                value={searchMerchant}
                onChange={(e) => setSearchMerchant(e.target.value)}
              />
            </div>
            
            <div className="w-full lg:w-48">
              <Select
                label="Category Filter"
                options={[{ value: 'all', label: 'All Categories' }, ...categories]}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              />
            </div>

            <div className="w-full lg:w-48">
              <Select
                label="Payment Filter"
                options={[{ value: 'all', label: 'All Methods' }, ...paymentMethods]}
                value={filterPayment}
                onChange={(e) => setFilterPayment(e.target.value)}
              />
            </div>

            <div className="w-full lg:w-fit shrink-0">
              <Button type="submit" variant="secondary" className="w-full lg:w-fit px-5 h-[42px] font-semibold">
                <Search className="h-4 w-4 mr-2" /> Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Ledger Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Transaction Ledger</CardTitle>
          <CardDescription>Filtered list of transactions logged in your profile</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
            </div>
          ) : expenses.length > 0 ? (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-border-color text-[10px] uppercase font-bold tracking-wider text-text-secondary">
                    <th className="pb-3 pl-2">Expense / Date</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Merchant</th>
                    <th className="pb-3">Payment Method</th>
                    <th className="pb-3 text-right">Amount</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-color/60">
                  {expenses.map((exp) => (
                    <tr key={exp._id} className="group hover:bg-card-sec/20 transition-colors">
                      <td className="py-4 pl-2">
                        <div className="text-sm font-semibold text-text-primary flex items-center gap-2">
                          <span className="truncate max-w-[150px] sm:max-w-xs">{exp.title}</span>
                          {exp.isScanned && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] font-bold text-accent-success bg-accent-success/15 px-1.5 py-0.5 rounded">
                              <Camera className="h-2 w-2" /> OCR
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-text-secondary font-medium mt-1.5">
                          {new Date(exp.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent-primary/10 text-accent-primary">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-4 text-sm font-medium text-text-primary">
                        {exp.merchant}
                      </td>
                      <td className="py-4 text-xs font-semibold text-text-secondary">
                        {exp.paymentMethod}
                      </td>
                      <td className="py-4 text-right text-sm font-bold text-text-primary">
                        -₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button
                          onClick={() => handleDeleteExpense(exp._id)}
                          className="p-1.5 rounded-lg text-text-secondary hover:text-accent-danger hover:bg-accent-danger/5 transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete Transaction"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center text-text-secondary font-medium text-sm">
              No matching expense logs found. Click New Transaction or Scan Receipt to add one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
