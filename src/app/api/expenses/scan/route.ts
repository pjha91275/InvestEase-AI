import { NextResponse } from 'next/server';
import { parseReceiptWithGemini } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text || text.trim() === '') {
      return NextResponse.json({ error: 'No OCR text provided' }, { status: 400 });
    }

    console.log('[Receipt Scanner API] Processing raw text length:', text.length);

    try {
      // 1. Try to parse using Gemini
      const parsedData = await parseReceiptWithGemini(text);
      console.log('[Receipt Scanner API] Gemini successfully parsed receipt:', parsedData);
      return NextResponse.json({ ...parsedData, parsedBy: 'Gemini' });
    } catch (geminiError: any) {
      console.warn('[Receipt Scanner API] Gemini parsing failed, triggering Regex fallback:', geminiError.message);
      
      // 2. Fallback Regex Parsing Engine
      const fallbackResult = parseReceiptWithRegex(text);
      console.log('[Receipt Scanner API] Regex fallback parsed receipt:', fallbackResult);
      return NextResponse.json({ ...fallbackResult, parsedBy: 'Regex Fallback' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error processing receipt scan' }, { status: 500 });
  }
}

// Regex-based receipt text heuristics
function parseReceiptWithRegex(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const normalizedText = text.toLowerCase();

  // Heuristic 1: Extract Merchant
  // Take the first line that doesn't contain standard receipt keywords
  let merchant = 'Unknown Merchant';
  const noiseWords = ['tax invoice', 'invoice', 'receipt', 'bill', 'welcome', 'cash memo', 'retail invoice'];
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const isNoise = noiseWords.some(word => lowerLine.includes(word)) || lowerLine.match(/^\d+$/) || lowerLine.length < 3;
    if (!isNoise) {
      merchant = line;
      break;
    }
  }
  // Clean merchant name from special characters
  merchant = merchant.replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();

  // Heuristic 2: Extract Total Amount
  // Find lines containing amount-like keywords and scan for float values
  let amount = 0;
  const amountKeywords = ['total', 'net', 'amount', 'due', 'subtotal', 'rs', 'inr', 'grand total'];
  const candidates: number[] = [];

  // Match float numbers of any length with optional formatting commas and decimals
  const floatRegex = /(?:rs\.?|inr|usd|\$|₹)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\b/gi;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const matchesKeyword = amountKeywords.some(keyword => lowerLine.includes(keyword));
    if (matchesKeyword) {
      let match;
      // Reset regex index
      floatRegex.lastIndex = 0;
      while ((match = floatRegex.exec(line)) !== null) {
        const val = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(val) && val > 0) {
          candidates.push(val);
        }
      }
    }
  }

  if (candidates.length > 0) {
    // Totals are typically the largest values on a receipt
    amount = Math.max(...candidates);
  } else {
    // If no keyword lines match, scan the whole text for numbers and find the largest
    const allMatches = normalizedText.match(/\b\d+\.\d{2}\b/g);
    if (allMatches) {
      const numbers = allMatches.map(n => parseFloat(n)).filter(n => !isNaN(n));
      if (numbers.length > 0) {
        amount = Math.max(...numbers);
      }
    }
  }

  // Heuristic 3: Extract Date
  let dateStr = new Date().toISOString().split('T')[0]; // Default to today
  // Match YYYY-MM-DD or DD/MM/YYYY or DD-MM-YYYY
  const dateRegex = /\b(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{4})\b/;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    const matchedDate = dateMatch[0];
    if (matchedDate.includes('/')) {
      const parts = matchedDate.split('/');
      if (parts[2].length === 4) { // DD/MM/YYYY
        dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (parts[0].length === 4) { // YYYY/MM/DD
        dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
      }
    } else if (matchedDate.includes('-')) {
      const parts = matchedDate.split('-');
      if (parts[2].length === 4) { // DD-MM-YYYY
        dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else if (parts[0].length === 4) { // YYYY-MM-DD
        dateStr = matchedDate;
      }
    }
  }

  // Heuristic 4: Map Category based on keywords
  let category = 'Others';
  const categoryKeywords: { [key: string]: string[] } = {
    Food: ['zomato', 'swiggy', 'hotel', 'restaurant', 'cafe', 'food', 'dining', 'pizza', 'burger', 'starbucks', 'coffee', 'subway', 'bakery', 'kitchen', 'eats'],
    Travel: ['uber', 'ola', 'train', 'irctc', 'rail', 'metro', 'flight', 'airline', 'indigo', 'taxi', 'fuel', 'petrol', 'diesel', 'cab', 'travel', 'bus'],
    Shopping: ['amazon', 'flipkart', 'mall', 'reliance', 'mart', 'clothing', 'shoe', 'apparel', 'grocery', 'groceries', 'blinkit', 'instamart', 'zepto', 'dmart', 'retail', 'fashion', 'jeans'],
    Education: ['school', 'college', 'course', 'udemy', 'coursera', 'book', 'stationary', 'tuition', 'fees', 'exam', 'training'],
    Medical: ['hospital', 'medical', 'pharmacy', 'apollo', 'chemist', 'doctor', 'clinic', 'medicine', 'pharma', 'healthcheck'],
    Entertainment: ['cinema', 'netflix', 'spotify', 'movie', 'pvr', 'theatre', 'gaming', 'ticket', 'show', 'club', 'pub', 'beer', 'wine', 'lounge'],
    Bills: ['jio', 'airtel', 'bill', 'electricity', 'recharge', 'bescom', 'tata', 'power', 'wifi', 'broadband', 'subscription', 'mobile', 'internet', 'gas', 'water'],
  };

  const merchantLower = merchant.toLowerCase();
  for (const cat of Object.keys(categoryKeywords)) {
    const hasMerchantMatch = categoryKeywords[cat].some(kw => merchantLower.includes(kw));
    const hasTextMatch = categoryKeywords[cat].some(kw => normalizedText.includes(kw));
    if (hasMerchantMatch || hasTextMatch) {
      category = cat;
      break;
    }
  }

  return {
    merchant,
    amount,
    date: dateStr,
    category,
    description: `Auto-extracted receipt scan from ${merchant}`,
  };
}
