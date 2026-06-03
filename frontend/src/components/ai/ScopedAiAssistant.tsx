'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = { id: string; role: 'user' | 'assistant'; content: string };

function getNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const n = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function topByNumericField<T extends Record<string, any>>(list: T[], n: number, fieldKeys: string[]) {
  const rows = list
    .map((row) => {
      for (const k of fieldKeys) {
        const v = getNumber(row?.[k]);
        if (v !== null) return { row, value: v, key: k };
      }
      return null;
    })
    .filter(Boolean) as Array<{ row: T; value: number; key: string }>;

  return rows.sort((a, b) => b.value - a.value).slice(0, n);
}

function fallbackAnswer(moduleName: string, data: unknown[], question: string): string {
  const q = question.toLowerCase();

  const mTop = q.match(/\btop\s+(\d+)\b/);
  const topN = mTop ? Math.max(1, Math.min(50, Number(mTop[1]))) : 5;

  if (moduleName.toLowerCase().includes('inventory')) {
    if (q.includes('top') && q.includes('product') && q.includes('unit') && q.includes('price')) {
      const list = (data as any[]).filter(Boolean);
      const top = topByNumericField(list, topN, ['unit_price', 'unitPrice']);
      if (top.length === 0) return 'Inventory: no products with a numeric unit price found.';
      return [
        `Top ${top.length} products by unit price:`,
        ...top.map((x, i) => {
          const name = x.row?.name ?? x.row?.productName ?? x.row?.sku ?? `#${x.row?.id ?? i + 1}`;
          return `${i + 1}. ${name} — ${x.value}`;
        }),
      ].join('\n');
    }
  }

  if (moduleName.toLowerCase().includes('orders')) {
    if (q.includes('top') && (q.includes('order') || q.includes('orders')) && (q.includes('amount') || q.includes('total'))) {
      const list = (data as any[]).filter(Boolean);
      const top = topByNumericField(list, topN, ['total_amount', 'totalAmount']);
      if (top.length === 0) return 'Orders: no orders with a numeric total amount found.';
      return [
        `Top ${top.length} orders by total amount:`,
        ...top.map((x, i) => {
          const name = x.row?.order_number ?? x.row?.orderNumber ?? `#${x.row?.id ?? i + 1}`;
          return `${i + 1}. ${name} — ${x.value}`;
        }),
      ].join('\n');
    }
  }

  if (q.includes('count by status') || (q.includes('count') && q.includes('status'))) {
    const counts = new Map<string, number>();
    for (const row of data as any[]) {
      const s = String(row?.status ?? row?.payment_status ?? row?.paymentStatus ?? 'UNKNOWN');
      counts.set(s, (counts.get(s) || 0) + 1);
    }
    const lines = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => `${k}: ${v}`);
    return lines.length ? lines.join('\n') : `${moduleName}: no status field found.`;
  }

  if (q.includes('how many') || q.includes('count') || q.includes('total records')) {
    return `${moduleName}: total records = ${data.length}.`;
  }

  const first = data[0] as any;
  if (q.includes('fields') || q.includes('columns')) {
    if (!first) return `${moduleName}: no data available.`;
    return `${moduleName}: fields = ${Object.keys(first).join(', ')}.`;
  }

  return `${moduleName}: I can answer questions using only this page data. Example: "count by status" or "top 5 by total amount".`;
}

export function ScopedAiAssistant({
  moduleName,
  data,
  suggestedPrompts,
}: {
  moduleName: string;
  data: unknown[];
  suggestedPrompts?: string[];
}) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hi! I am the ${moduleName} AI Assistant. I can answer questions only about the ${moduleName} screen data.`,
    },
  ]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const assistantMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

    try {
      const fallbackText = fallbackAnswer(moduleName, data, userMsg.content);
      const sliced = Array.isArray(data) ? data.slice(0, 200) : [];
      const response = await fetch('/api/ai/scoped-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleName,
          question: userMsg.content,
          data: sliced,
          totalCount: Array.isArray(data) ? data.length : 0,
          model: 'openai/gpt-oss-120b:free',
          fallbackText,
        }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        setMessages((prev) => prev.map((m) => (m.id === assistantMsgId ? { ...m, content: fallbackText } : m)));
        return;
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          const content = line.substring(5).trim();
          if (!content || content === '[DONE]') continue;
          try {
            const parsed = JSON.parse(content);
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantMsgId ? { ...m, content: m.content + parsed.text } : m))
              );
            }
          } catch (e) {
            // ignore JSON parse error on incomplete chunks
          }
        }
      }
    } catch {
      const text = fallbackAnswer(moduleName, data, userMsg.content);
      setMessages((prev) => prev.map((m) => (m.id === assistantMsgId ? { ...m, content: text } : m)));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Card className="border-primary/10 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center border border-primary/25">
            <Bot className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{moduleName} AI</p>
          </div>
        </div>
      </div>

      {suggestedPrompts && suggestedPrompts.length > 0 && (
        <div className="p-3 border-b bg-muted/20 flex flex-wrap gap-2">
          {suggestedPrompts.slice(0, 6).map((p) => (
            <button
              key={p}
              onClick={() => setInput(p)}
              className="text-xs px-3 py-1.5 rounded-full border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="h-80 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex w-full', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('flex gap-3 max-w-[90%]', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
              <div
                className={cn(
                  'flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border'
                )}
              >
                {msg.role === 'user' ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
              </div>
              <div
                className={cn(
                  'px-3 py-2 rounded-2xl text-sm leading-relaxed overflow-x-auto',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted rounded-tl-sm border shadow-sm prose prose-sm dark:prose-invert max-w-none'
                )}
              >
                {msg.role === 'user' ? (
                  msg.content
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-background border-t">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${moduleName} data...`}
            className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <Button type="submit" size="icon" className="rounded-full" disabled={!input.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
