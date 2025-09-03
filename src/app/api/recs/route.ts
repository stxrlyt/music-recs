import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const {prompt} = await req.json();

    if(!prompt) {
      return NextResponse.json('Missing prompt', { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey){
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    console.log('Received prompt: ', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful music recommendation assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if(!response.ok){
      const errorText = await response.text();
      console.error('OpenAI API error: ', errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    console.log('Reply: ', reply);

    return NextResponse.json({ reply: reply || '' });
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
