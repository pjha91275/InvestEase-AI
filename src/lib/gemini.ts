import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
// Using the standard, high-speed gemini-1.5-flash model
const MODEL_NAME = 'gemini-1.5-flash';

// Create the model instance if key exists
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

interface GeminiResult {
  text: string;
  isFallback: boolean;
}

export async function askGemini(prompt: string, chatHistory: any[] = []): Promise<GeminiResult> {
  if (!genAI) {
    console.warn('[Gemini API Key Warning] GEMINI_API_KEY env key is missing or undefined.');
    throw new Error('Gemini API Key (GEMINI_API_KEY) is not configured in the environment variables (.env). Please set it to enable the AI Assistant.');
  }

  try {
    console.log(`[Gemini API Request] model="${MODEL_NAME}" prompt="${prompt}" historyCount=${chatHistory.length}`);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const systemPrompt = `You are InvestEase AI, an expert financial wellness advisor. 
    Provide structured, encouraging guidance on budget advice, savings, expense analysis, emergency funds, UPI safety, scam awareness, tax basics, and credit scores. 
    Limit responses to 2-3 paragraphs. Use lists where helpful. Avoid speculative stock predictions.`;

    const sanitizedHistory: any[] = [];
    let expectedRole = 'user';
    for (const h of chatHistory) {
      if (h.role === expectedRole) {
        sanitizedHistory.push(h);
        expectedRole = expectedRole === 'user' ? 'model' : 'user';
      }
    }
    if (sanitizedHistory.length > 0 && sanitizedHistory[sanitizedHistory.length - 1].role === 'user') {
      sanitizedHistory.pop();
    }

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'I am InvestEase AI, ready to assist.' }] },
        ...sanitizedHistory,
      ],
    });

    const result = await chat.sendMessage(prompt);
    const text = result.response.text();
    console.log(`[Gemini API Response] model="${MODEL_NAME}" textLength=${text?.length}`);
    
    if (!text || text.trim() === '') {
      throw new Error('Empty response payload received from Gemini API.');
    }

    return {
      text,
      isFallback: false
    };
  } catch (error: any) {
    console.error(`[Gemini API Failure] Model: ${MODEL_NAME}`, error);
    
    let errMsg = error.message || 'Unknown Gemini API connection error';
    if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('key is invalid') || errMsg.includes('API key not valid')) {
      errMsg = 'The configured Gemini API Key is invalid. Please double-check your .env file.';
    } else if (errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('quota') || errMsg.includes('429')) {
      errMsg = 'Gemini API Rate Limit Exceeded. Please try again in a few seconds.';
    } else if (errMsg.includes('DEADLINE_EXCEEDED') || errMsg.includes('timeout')) {
      errMsg = 'Gemini API connection timed out. Please check your internet connection.';
    } else if (errMsg.includes('MODEL_NOT_FOUND') || errMsg.includes('404') || errMsg.includes('not found')) {
      errMsg = `The requested model "${MODEL_NAME}" was not found or is unsupported.`;
    }

    throw new Error(errMsg);
  }
}

export async function parseReceiptWithGemini(ocrText: string): Promise<{
  merchant: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string; // One of: Food, Travel, Shopping, Education, Medical, Entertainment, Bills, Others
  description: string;
}> {
  if (!genAI) {
    throw new Error('Gemini API Key is not configured.');
  }

  try {
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const prompt = `You are a financial receipt parser. Analyze the following OCR text extracted from a transaction receipt and extract:
    1. Merchant name (business/store name)
    2. Total transaction amount (as a number, convert foreign currency to INR if applicable or parse as-is)
    3. Transaction date (format YYYY-MM-DD. If year is missing or looks future relative to today, assume current year 2026)
    4. Best matching category. Choose EXACTLY one of: "Food", "Travel", "Shopping", "Education", "Medical", "Entertainment", "Bills", "Others".
    5. Short description of the items bought.

    OCR Text:
    """
    ${ocrText}
    """

    Return your response ONLY as a valid JSON object matching this schema, without markdown formatting or code blocks:
    {
      "merchant": "string",
      "amount": number,
      "date": "string",
      "category": "string",
      "description": "string"
    }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // Clean potential markdown codeblock formatting
    const cleanJsonText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJsonText);
  } catch (error: any) {
    console.error('[Gemini Receipt Parse Failure]', error);
    throw error;
  }
}

export { genAI };
