// Local diagnostic checking of the receipt scanner offline regex heuristics
const noiseWords = ['tax invoice', 'invoice', 'receipt', 'bill', 'welcome', 'cash memo', 'retail invoice'];
const amountKeywords = ['total', 'net', 'amount', 'due', 'subtotal', 'rs', 'inr', 'grand total'];
const floatRegex = /(?:rs\.?|inr|usd|\$|₹)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\b/gi;
const dateRegex = /\b(\d{4}[-/]\d{2}[-/]\d{2})|(\d{2}[-/]\d{2}[-/]\d{4})\b/;

const categoryKeywords = {
  Food: ['zomato', 'swiggy', 'hotel', 'restaurant', 'cafe', 'food', 'dining', 'pizza', 'burger', 'starbucks', 'coffee', 'subway', 'bakery', 'kitchen', 'eats'],
  Travel: ['uber', 'ola', 'train', 'irctc', 'rail', 'metro', 'flight', 'airline', 'indigo', 'taxi', 'fuel', 'petrol', 'diesel', 'cab', 'travel', 'bus'],
  Shopping: ['amazon', 'flipkart', 'mall', 'reliance', 'mart', 'clothing', 'shoe', 'apparel', 'grocery', 'groceries', 'blinkit', 'instamart', 'zepto', 'dmart', 'retail', 'fashion', 'jeans'],
  Education: ['school', 'college', 'course', 'udemy', 'coursera', 'book', 'stationary', 'tuition', 'fees', 'exam', 'training'],
  Medical: ['hospital', 'medical', 'pharmacy', 'apollo', 'chemist', 'doctor', 'clinic', 'medicine', 'pharma', 'healthcheck'],
  Entertainment: ['cinema', 'netflix', 'spotify', 'movie', 'pvr', 'theatre', 'gaming', 'ticket', 'show', 'club', 'pub', 'beer', 'wine', 'lounge'],
  Bills: ['jio', 'airtel', 'bill', 'electricity', 'recharge', 'bescom', 'tata', 'power', 'wifi', 'broadband', 'subscription', 'mobile', 'internet', 'gas', 'water'],
};

function parseReceiptWithRegex(text) {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  const normalizedText = text.toLowerCase();

  let merchant = 'Unknown Merchant';
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const isNoise = noiseWords.some(word => lowerLine.includes(word)) || lowerLine.match(/^\d+$/) || lowerLine.length < 3;
    if (!isNoise) {
      merchant = line;
      break;
    }
  }
  merchant = merchant.replace(/[^a-zA-Z0-9\s&'-]/g, '').trim();

  let amount = 0;
  const candidates = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    const matchesKeyword = amountKeywords.some(keyword => lowerLine.includes(keyword));
    if (matchesKeyword) {
      let match;
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
    amount = Math.max(...candidates);
  } else {
    const allMatches = normalizedText.match(/\b\d+\.\d{2}\b/g);
    if (allMatches) {
      const numbers = allMatches.map(n => parseFloat(n)).filter(n => !isNaN(n));
      if (numbers.length > 0) {
        amount = Math.max(...numbers);
      }
    }
  }

  let dateStr = new Date().toISOString().split('T')[0];
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

  let category = 'Others';
  const merchantLower = merchant.toLowerCase();
  for (const cat of Object.keys(categoryKeywords)) {
    const hasMerchantMatch = categoryKeywords[cat].some(kw => merchantLower.includes(kw));
    const hasTextMatch = categoryKeywords[cat].some(kw => normalizedText.includes(kw));
    if (hasMerchantMatch || hasTextMatch) {
      category = cat;
      break;
    }
  }

  return { merchant, amount, date: dateStr, category };
}

// TEST CASES
const swiggyReceipt = `
SWIGGY FOOD DELIVERY
Order #49283928
Date: 25/07/2026
---------------------
1x Paneer Butter Masala: Rs. 350.00
1x Garlic Naan: Rs. 80.00
---------------------
SUBTOTAL: INR 430.00
GST: Rs. 21.50
GRAND TOTAL: Rs. 451.50
`;

const amazonReceipt = `
AMAZON RETAIL SERVICES
INVOICE GST-38291
Date: 2026-07-15
Item: Wireless Mouse 1 unit
Total Amount Due: USD 25.00
Paid via Credit Card
`;

console.log("--- Running OCR Offline Regex Parser Tests ---");

const test1 = parseReceiptWithRegex(swiggyReceipt);
console.log("Test 1 (Swiggy):", test1);
if (test1.merchant === 'SWIGGY FOOD DELIVERY' && test1.amount === 451.5 && test1.category === 'Food' && test1.date === '2026-07-25') {
  console.log("✓ Test 1 Passed!");
} else {
  console.error("✗ Test 1 Failed!");
  process.exit(1);
}

const test2 = parseReceiptWithRegex(amazonReceipt);
console.log("Test 2 (Amazon):", test2);
if (test2.merchant === 'AMAZON RETAIL SERVICES' && test2.amount === 25 && test2.category === 'Shopping' && test2.date === '2026-07-15') {
  console.log("✓ Test 2 Passed!");
} else {
  console.error("✗ Test 2 Failed!");
  process.exit(1);
}

const laptopReceipt = `
Tax Invoice
Sold By: Health & Happiness Private Limited
GSTIN - 29AADCH8449J1Z0
Invoice Number # FAIH9X2500043424
Order Date: 21-07-2024
Invoice Date: 24-07-2024
-----------------------------
Laptops: Acer Swift Go 14 EVO OLED Intel Core i5 13th Gen...
Qty: 1
Gross Amount: 56990.00
Discounts: 0.00
Taxable Value: 48296.61
IGST: 8693.39
Total: 56990.00
-----------------------------
Grand Total ₹ 56990.00
`;

const test3 = parseReceiptWithRegex(laptopReceipt);
console.log("Test 3 (Laptop Invoice):", test3);
if (test3.merchant === 'Sold By Health & Happiness Private Limited' && test3.amount === 56990 && test3.date === '2024-07-21') {
  console.log("✓ Test 3 Passed!");
} else {
  console.error("✗ Test 3 Failed!");
  process.exit(1);
}

console.log("All OCR fallback parser unit tests completed successfully!");
