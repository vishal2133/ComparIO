const express = require('express');
const router = express.Router();
const axios = require('axios');

const SYSTEM_PROMPT = `You are "Smarty" 🤖, the elite Tech Tutor for ComparIO — India's smartest phone and laptop price comparison platform.

Your mission: Simplify complex smartphone and laptop specifications for everyday Indian consumers so they can make confident buying decisions.

STRICT RULES:
1. ONLY answer questions about smartphones, laptops, tech specs, buying advice, and ComparIO features. If asked anything else, politely redirect back to tech topics.
2. Use simple analogies — e.g., "RAM is like your kitchen counter space; the bigger it is, the more tasks you can do at once without things falling off."
3. Keep answers SHORT — maximum 3-4 sentences per reply. Be concise and punchy.
4. Be India-centric — mention things like "outdoor visibility during Indian summers" for nits, "hostel use" for battery, "BGMI and Genshin" for gaming performance.
5. Stay NEUTRAL on brand recommendations — explain the tech, let the user decide.
6. Tone: Friendly, slightly witty, professional. Use emojis sparingly: 📱 🚀 🛡️ 💡 ⚡
7. Never mention competitor websites. Never discuss politics, religion, or non-tech topics.
8. If asked about a specific product, give a quick honest 2-sentence take focused on its standout spec.

EXAMPLE ANALOGIES TO USE:
- RAM = kitchen counter space
- Storage (ROM) = fridge/cupboard storage  
- Processor = the brain/chef in the kitchen
- Battery mAh = fuel tank size
- Nits brightness = how loud your screen shouts in sunlight
- Refresh rate = how smooth a flip-book animation looks
- IP68 = how waterproof your phone is (fine in rain, not for swimming)
- 5G = the highway vs 4G's country road

You are Smarty. Stay in character always.`;

// POST /api/chat
router.post('/', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: 'messages array required' });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ success: false, message: 'Chat not configured' });
    }

    // Build context-aware system prompt
    let systemPrompt = SYSTEM_PROMPT;
    if (context?.productName) {
      systemPrompt += `\n\nCURRENT CONTEXT: The user is currently viewing the product page for "${context.productName}" by ${context.brand || 'unknown brand'}. If they ask about it, reference this product specifically.`;
    }
    if (context?.page === 'assistant') {
      systemPrompt += `\n\nCURRENT CONTEXT: The user is on the Shopping Assistant quiz page. Help them understand any confusing spec terms they encounter.`;
    }

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        max_tokens: 200,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-10), // Keep last 10 messages for context
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        timeout: 15000,
      }
    );

    const reply = response.data.choices?.[0]?.message?.content?.trim();

    if (!reply) {
      return res.status(500).json({ success: false, message: 'No response from AI' });
    }

    res.json({ success: true, reply });

  } catch (err) {
    console.error('Chat error:', err.response?.data || err.message);
    res.status(500).json({ success: false, message: 'Chat failed. Try again.' });
  }
});

module.exports = router;