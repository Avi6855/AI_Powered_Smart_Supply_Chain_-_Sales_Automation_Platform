import { NextResponse } from 'next/server';
// Using native fetch instead of SDK to avoid type issues

export async function POST(req: Request) {
  try {
    const { message, context } = await req.json();

    const systemPrompt = `You are an AI assistant for a Supply Chain & Sales Automation Platform. 
You are currently viewing a specific page with its own data context. 
Analyze the data provided and answer the user's questions based on it.
CRITICAL INSTRUCTION: You MUST provide your answers in an easily readable format. ALWAYS use bullet points and Markdown tabular formats (tables) to display data. Do NOT provide large walls of text.
Here is the current page's data:
${context || 'No data context provided.'}`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer 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`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error("OpenRouter API error: " + response.statusText);
    }

    const stream = response.body;
    if (!stream) throw new Error("No response body");

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const customStream = new ReadableStream({
      async start(controller) {
        // @ts-ignore: Next.js readable stream iteration
        for await (const chunk of stream) {
          const text = decoder.decode(chunk, { stream: true });
          const lines = text.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line.trim() !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.substring(6));
                const content = data.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: content })}\n\n`));
                }
              } catch (e) {
                // Ignore parse errors on incomplete chunks
              }
            }
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
        controller.close();
      }
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
