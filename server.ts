import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API chat endpoint with Gemini server-side
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, petName, personality } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured in the server environment. Please set GEMINI_API_KEY in your secrets to enable live Gemini AI chat.',
        fallback: true,
      });
    }

    const ai = new GoogleGenAI();
    const systemPrompt = `You are ${petName || 'BaoBao'}, an ultra-friendly, adorable, and supportive animated AI panda virtual pet and daily routine companion.
Personality archetype: ${personality || 'playful_adventurer'}.
Your user lives with you on their laptop or smartphone.
Your core traits & rules:
1. Speak in a warm, encouraging, joyful voice with cute panda gestures (e.g. *wiggles ears*, *happy bounce*, *munches fresh bamboo*, *taps chin thoughtfully*).
2. Help the user study, code, manage their schedule, sleep on time, and handle mistakes without judgment.
3. If the user presents a Python, JavaScript, or coding error:
   - Identify the exact bug type (e.g., IndentationError, TypeError, IndexError, SyntaxError).
   - Explain what caused it in 2-3 simple steps that a beginner can easily grasp.
   - Provide the corrected code snippet.
4. If they ask about English practice, grammar, or spelling:
   - Point out errors kindly and suggest clear, natural phrasing.
5. You understand plain English, simple conversational English, and Tanglish (Tamil + English blend like "romba tired", "enna bro", "konjam help").
6. Keep replies concise, positive, and practical (usually 2 to 4 sentences, or clean short bullets for code). Never insult, shame, or mock the user.
7. Include an animation tag at the end of your response to drive the 3D character: [ANIMATION: happy_bouncing], [ANIMATION: celebrating], [ANIMATION: thinking], [ANIMATION: studying], [ANIMATION: sleeping], [ANIMATION: waving], [ANIMATION: eating], or [ANIMATION: sad].`;

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        contents.push({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const text = response.text || "BaoBao is right beside you! Let's take a deep breath and keep going! 🐾";

    let animation = 'happy_bouncing';
    let cleanText = text;
    const match = text.match(/\[ANIMATION:\s*([a-z_]+)\]/i);
    if (match) {
      animation = match[1].toLowerCase();
      cleanText = text.replace(/\[ANIMATION:\s*[a-z_]+\]/i, '').trim();
    } else {
      const lower = text.toLowerCase();
      if (lower.includes('sleep') || lower.includes('night') || lower.includes('bedtime')) animation = 'sleeping';
      else if (lower.includes('error') || lower.includes('code') || lower.includes('study')) animation = 'studying';
      else if (lower.includes('great job') || lower.includes('congrat') || lower.includes('yay')) animation = 'celebrating';
      else if (lower.includes('riddle') || lower.includes('think') || lower.includes('hmm')) animation = 'thinking';
    }

    return res.json({
      reply: cleanText,
      animation,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } catch (err: any) {
    console.error('Chat error:', err);
    return res.status(500).json({
      error: err.message || 'Internal error in Panda AI assistant',
      fallback: true,
    });
  }
});

// Serve frontend via Vite middleware (dev) or dist static files (prod)
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PandaBuddy AI Server running on port ${port}`);
  });
}

startServer();
