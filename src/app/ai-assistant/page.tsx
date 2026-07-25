'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Send, Sparkles, User, ShieldAlert, Bot } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface ChatMessage {
  _id?: string;
  role: 'user' | 'model' | 'assistant';
  message: string;
  timestamp?: string;
}

export default function AIAssistant() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchChatHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await fetch('/api/chat');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchChatHistory();
    }
  }, [status, router]);

  // Scroll to bottom on message change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() === '' || sending) return;

    const userPrompt = inputMessage;
    setInputMessage('');
    setSending(true);
    setError('');

    // Append User message locally for real-time response feel
    setMessages((prev) => [...prev, { role: 'user', message: userPrompt }]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: 'model', message: data.message }]);
      } else {
        throw new Error(data.error || 'Failed to communicate with AI');
      }
    } catch (err: any) {
      setError(err.message || 'Connection to server lost. Could not communicate with Gemini API.');
    } finally {
      setSending(false);
    }
  };

  const starterPrompts = [
    'Explain the 50/30/20 budget method.',
    'How do I calculate emergency fund goals?',
    'Tips on compound interest.',
    'Tips for lowering electricity bills.',
  ];

  if (status === 'loading' || loadingHistory) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <span className="text-sm font-medium text-text-secondary">Loading AI chat logs...</span>
      </div>
    );
  }

  return (
    <div className="h-[80vh] flex flex-col justify-between gap-4 animate-fadeIn">
      {/* Header Block */}
      <div>
        <h1 className="text-2xl sm:text-[36px] font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-accent-success shrink-0" />
          AI Financial Assistant
        </h1>
        <p className="text-sm text-text-secondary font-medium mt-1">
          Ask questions regarding savings, budget limits, or interest calculations.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-accent-danger/5 border border-accent-danger/25 text-accent-danger rounded-xl text-xs font-semibold flex items-start gap-2">
          <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main chat layout */}
      <Card className="flex-grow flex-1 overflow-hidden p-0 flex flex-col justify-between border border-border-color">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[50vh] sm:max-h-[55vh]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-lg mx-auto">
              <div className="p-4 bg-card-sec border border-border-color rounded-2xl text-accent-success animate-pulse">
                <Bot className="h-10 w-10 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">Start your conversation</h3>
                <p className="text-xs text-text-secondary font-medium mt-1.5 leading-relaxed">
                  InvestEase AI is equipped to assist you on tax basics, emergency fund limits, and budgeting questions. Choose a topic below to begin.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {starterPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputMessage(prompt)}
                    className="p-3 text-left border border-border-color hover:bg-card-sec text-xs font-semibold text-text-secondary hover:text-text-primary rounded-xl transition-all cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isUser
                        ? 'bg-accent-primary text-white shadow-sm'
                        : 'bg-card-sec border border-border-color text-text-primary'
                    }`}
                  >
                    {isUser ? <User className="h-4.5 w-4.5" /> : <Bot className="h-4.5 w-4.5" />}
                  </div>
                  <div
                    className={`p-4 rounded-xl text-xs sm:text-sm font-medium leading-relaxed ${
                      isUser
                        ? 'bg-accent-primary text-white rounded-tr-none shadow-sm'
                        : 'bg-card-sec border border-border-color text-text-primary rounded-tl-none'
                    }`}
                    style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {msg.message}
                  </div>
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex gap-3 mr-auto items-center">
              <div className="w-8 h-8 rounded-full bg-card-sec border border-border-color text-text-primary flex items-center justify-center text-xs shrink-0">
                <Bot className="h-4.5 w-4.5" />
              </div>
              <div className="p-4 bg-card-sec border border-border-color rounded-xl rounded-tl-none flex items-center gap-2.5 text-xs font-semibold text-text-secondary">
                <Loader2 className="h-4.5 w-4.5 animate-spin text-accent-primary" />
                InvestEase is typing...
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-border-color bg-card">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              required
              disabled={sending}
              placeholder="Ask InvestEase anything (e.g., Explain compound interest)..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-grow px-4 py-2.5 rounded-xl text-sm transition-all duration-150 outline-none border bg-card-sec border-border-color text-text-primary placeholder:text-text-secondary/40 focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/10"
            />
            <Button type="submit" disabled={sending || inputMessage.trim() === ''} className="px-5 cursor-pointer">
              <Send className="h-4.5 w-4.5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
