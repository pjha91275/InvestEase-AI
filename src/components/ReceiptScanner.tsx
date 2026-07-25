'use client';

import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReceiptScannerProps {
  onScanComplete: (data: {
    merchant: string;
    amount: number;
    date: string;
    category: string;
    description: string;
  }) => void;
  onClose: () => void;
}

export default function ReceiptScanner({ onScanComplete, onClose }: ReceiptScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setError('');
      setSuccess(false);
    }
  };

  const handleScan = async () => {
    if (!file) {
      setError('Please select a receipt image first.');
      return;
    }

    setScanning(true);
    setProgress(0);
    setStatusText('Loading OCR engine...');
    setError('');

    try {
      // 1. Run Tesseract.js client-side OCR
      const result = await Tesseract.recognize(
        file,
        'eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing') {
              setStatusText(`Recognizing receipt text (${Math.round(m.progress * 100)}%)`);
              setProgress(Math.round(m.progress * 100));
            } else {
              setStatusText(m.status);
            }
          }
        }
      );

      const ocrText = result.data.text;
      
      if (!ocrText || ocrText.trim() === '') {
        throw new Error('Could not extract any legible text from the image. Please try a clearer picture.');
      }

      setStatusText('Parsing text with AI advisor...');
      setProgress(95);

      // 2. Call our API route to parse the OCR text
      const res = await fetch('/api/expenses/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: ocrText }),
      });

      const parsedResult = await res.json();

      if (!res.ok) {
        throw new Error(parsedResult.error || 'Failed to parse text from receipt.');
      }

      setSuccess(true);
      setStatusText('Scan complete!');
      setProgress(100);

      // 3. Callback to populate parent form fields
      setTimeout(() => {
        onScanComplete({
          merchant: parsedResult.merchant || '',
          amount: parsedResult.amount || 0,
          date: parsedResult.date || '',
          category: parsedResult.category || 'Others',
          description: parsedResult.description || `Scanned receipt from ${parsedResult.merchant}`,
        });
      }, 1000);

    } catch (err: any) {
      console.error('[OCR Scan Error]', err);
      setError(err.message || 'An error occurred during OCR scanning.');
      setScanning(false);
    }
  };

  return (
    <div className="p-6 bg-card-sec/50 border border-border-color rounded-2xl space-y-4 transition-colors duration-200">
      <div className="flex justify-between items-center pb-2 border-b border-border-color">
        <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
          <Camera className="h-4 w-4 text-accent-primary" />
          Receipt Scanning OCR
        </h3>
        <button 
          onClick={onClose} 
          className="text-xs text-text-secondary hover:text-text-primary font-semibold"
          disabled={scanning}
        >
          Close Scanner
        </button>
      </div>

      {!imagePreview ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-border-color rounded-xl p-8 hover:border-accent-primary/50 transition-colors cursor-pointer relative group">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <Camera className="h-8 w-8 text-text-secondary group-hover:text-accent-primary transition-colors mb-3" />
          <span className="text-xs font-semibold text-text-primary">Click to upload a receipt image</span>
          <span className="text-[10px] text-text-secondary mt-1">PNG, JPG, or WEBP up to 5MB</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative h-44 rounded-xl border border-border-color bg-black/10 overflow-hidden flex items-center justify-center">
            <img 
              src={imagePreview} 
              alt="Receipt preview" 
              className="max-h-full max-w-full object-contain"
            />
            {!scanning && (
              <button
                onClick={() => {
                  setImagePreview(null);
                  setFile(null);
                  setSuccess(false);
                }}
                className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 text-[10px] font-bold px-2.5 py-1 border border-white/10"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-col justify-center space-y-4">
            {scanning ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                  <Loader2 className="h-4.5 w-4.5 animate-spin text-accent-primary" />
                  <span>{statusText}</span>
                </div>
                <div className="w-full bg-card-sec h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-accent-primary h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : success ? (
              <div className="p-4 bg-accent-success/5 border border-accent-success/20 text-accent-success rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <div>
                  <span className="block font-bold">Analysis Complete!</span>
                  <span className="block text-[10px] text-accent-success/80 font-medium mt-0.5">Populating expense form...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                  Click below to scan and analyze this receipt. InvestEase AI will automatically extract merchant details, transaction dates, totals, and suggest categories.
                </p>
                <Button 
                  onClick={handleScan}
                  className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Sparkles className="h-4 w-4" /> Start AI Analysis
                </Button>
              </div>
            )}

            {error && (
              <div className="p-3 bg-accent-danger/5 border border-accent-danger/20 text-accent-danger rounded-xl flex items-start gap-2 text-xs font-semibold">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
