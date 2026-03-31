
const PROVIDER = process.env.SCHOLAR_PROVIDER || 'gemini';

const DEFAULT_MODELS = {
  anthropic: 'claude-sonnet-4-20250514',
  gemini:    'gemini-1.5-flash',
  groq:      'llama3-70b-8192',
  ollama:    'llama3',
};

export async function chat({ system, user, maxTokens = 2000, onChunk }) {
  switch (PROVIDER.toLowerCase()) {
    case 'anthropic': return chatAnthropic({ system, user, maxTokens, onChunk });
    case 'gemini':    return chatGemini({ system, user, maxTokens, onChunk });
    case 'groq':      return chatGroq({ system, user, maxTokens, onChunk });
    case 'ollama':    return chatOllama({ system, user, maxTokens, onChunk });
    default: throw new Error(`Unknown provider: "${PROVIDER}". Use: gemini | groq | ollama | anthropic`);
  }
}

// ââ Anthropic ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
async function chatAnthropic({ system, user, maxTokens, onChunk }) {
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const stream = client.messages.stream({
    model: DEFAULT_MODELS.anthropic,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  });
  let full = '';
  for await (const chunk of stream) {
    if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
      full += chunk.delta.text;
      onChunk?.(chunk.delta.text);
    }
  }
  return full;
}

// ââ Gemini FREE (1500 req/day) âââââââââââââââââââââââââââââââââââââââââââââ
async function chatGemini({ system, user, maxTokens, onChunk }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not set. Get a free key at aistudio.google.com');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODELS.gemini}:streamGenerateContent?alt=sse&key=${apiKey}`;
  const body = {
    system_instruction: { parts: [{ text: system }] },
    contents: [{ role: 'user', parts: [{ text: user }] }],
    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.4 },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini error ${response.status}: ${err}`);
  }

  let full = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const json = JSON.parse(data);
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        if (text) { full += text; onChunk?.(text); }
      } catch { /* skip malformed chunks */ }
    }
  }
  return full;
}

// ââ Groq FREE (Llama 3) ââââââââââââââââââââââââââââââââââââââââââââââââââââ
async function chatGroq({ system, user, maxTokens, onChunk }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not set. Get a free key at console.groq.com');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: DEFAULT_MODELS.groq,
      max_tokens: maxTokens,
      stream: true,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq error ${response.status}: ${err}`);
  }

  let full = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const text = JSON.parse(data).choices?.[0]?.delta?.content ?? '';
        if (text) { full += text; onChunk?.(text); }
      } catch { /* skip */ }
    }
  }
  return full;
}

// ââ Ollama LOCAL (100% free, no internet) âââââââââââââââââââââââââââââââââ
async function chatOllama({ system, user, maxTokens, onChunk }) {
  const baseUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: DEFAULT_MODELS.ollama,
      stream: true,
      options: { num_predict: maxTokens },
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error. Is it running? Start with: ollama serve  then: ollama pull llama3`);
  }

  let full = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    for (const line of decoder.decode(value).split('\n').filter(Boolean)) {
      try {
        const text = JSON.parse(line).message?.content ?? '';
        if (text) { full += text; onChunk?.(text); }
      } catch { /* skip */ }
    }
  }
  return full;
}

// ââ Provider info ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export function getProviderInfo() {
  const map = {
    anthropic: { name: 'Anthropic Claude',    free: false, model: DEFAULT_MODELS.anthropic },
    gemini:    { name: 'Google Gemini Flash', free: true,  model: DEFAULT_MODELS.gemini,  note: '1500 req/day free' },
    groq:      { name: 'Groq (Llama 3)',      free: true,  model: DEFAULT_MODELS.groq,    note: 'free tier' },
    ollama:    { name: 'Ollama (local)',       free: true,  model: DEFAULT_MODELS.ollama,  note: 'runs on your machine' },
  };
  return map[PROVIDER] || { name: PROVIDER, free: false, model: 'unknown' };
}

export function checkApiKey() {
  const keys = { anthropic: 'ANTHROPIC_API_KEY', gemini: 'GEMINI_API_KEY', groq: 'GROQ_API_KEY', ollama: null };
  const keyName = keys[PROVIDER] ?? 'API_KEY';
  const ok = PROVIDER === 'ollama' ? true : !!process.env[keyName];
  return { ok, keyName };
}
