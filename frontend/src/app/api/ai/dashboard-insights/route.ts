import { OpenRouter } from '@openrouter/sdk';

type Body = {
  metrics: Record<string, unknown>;
  revenueChart: Array<{ name: string; revenue: number; orders: number }>;
};

function extractJson(text: string): any | null {
  const cleaned = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '');
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function fallback(body: Body) {
  const revenue = Number(body.metrics.totalRevenue ?? 0);
  const lowStock = Number(body.metrics.lowStockAlerts ?? 0);
  const activeProducts = Number(body.metrics.activeProducts ?? 0);
  const suppliersCount = Number(body.metrics.suppliersCount ?? 0);

  const insights = [
    `Total revenue is ${revenue.toFixed(2)} based on current Orders data.`,
    `Low stock alerts: ${lowStock}. Prioritize replenishment for items below reorder points.`,
    `Active products: ${activeProducts}. Suppliers tracked: ${suppliersCount}.`,
  ];

  const chart = body.revenueChart.slice(-7).map((x, i) => ({
    name: x.name,
    score: Math.max(10, Math.min(100, Math.round((x.revenue / Math.max(1, revenue)) * 100))),
    idx: i + 1,
  }));

  return { insights, chart };
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return Response.json(fallback(body));

  const openrouter = new OpenRouter({ apiKey });
  const system = [
    'You are Sales Analytics AI.',
    'You must output ONLY valid JSON with this exact shape:',
    '{ "insights": string[3..6], "chart": { "name": string, "score": number }[7..12] }',
    'Use ONLY the provided metrics and revenueChart.',
    `metrics: ${JSON.stringify(body.metrics)}`,
    `revenueChart: ${JSON.stringify(body.revenueChart)}`,
  ].join('\n');

  try {
    const res = await (openrouter as any).chat.send({
      model: 'openai/gpt-oss-120b:free',
      messages: [{ role: 'system', content: system }, { role: 'user', content: 'Generate insights and chart.' }],
    });

    const text = (res as any)?.choices?.[0]?.message?.content ?? '';
    const json = extractJson(text);
    if (!json?.insights || !json?.chart) return Response.json(fallback(body));
    return Response.json(json);
  } catch {
    return Response.json(fallback(body));
  }
}
