const Product = require('../models/Product');

const getPersonalizedSummary = async (req, res) => {
  try {
    const { slug, userAnswers, inDetail } = req.body;

    if (!slug) {
      return res.status(400).json({ success: false, message: 'slug required' });
    }

    const product = await Product.findOne({ slug });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Build context strings
    const bestPrice = Math.min(...product.prices.map(p => p.price));
    const bestPlatform = product.prices.reduce((a, b) => a.price < b.price ? a : b).platform;

    // Build user needs string from their quiz answers
    let userNeedsText = 'General buyer with no specific preferences stated.';

    if (userAnswers && Object.keys(userAnswers).length > 0) {
      const needs = [];

      if (userAnswers.budget) {
        needs.push(`Budget: up to ₹${Number(userAnswers.budget).toLocaleString('en-IN')}`);
      }
      if (userAnswers.priorities?.length > 0) {
        const priorityMap = {
          camera: 'great camera quality',
          battery: 'long battery life',
          gaming: 'gaming performance and cooling',
          charging: 'fast charging speed',
          display: 'high quality display',
          performance: 'fast performance and multitasking',
          build: 'durability and build quality',
          audio: 'good audio and headphone jack',
        };
        const priorityLabels = userAnswers.priorities
          .map(p => priorityMap[p] || p)
          .join(' and ');
        needs.push(`Top priorities: ${priorityLabels}`);
      }
      if (userAnswers.usage) {
        const usageMap = {
          daily: 'daily social media and casual use',
          work: 'work and productivity',
          gaming: 'heavy gaming (BGMI, Genshin Impact)',
          photography: 'photography and content creation',
          basic: 'basic calls and WhatsApp',
        };
        needs.push(`Primary use: ${usageMap[userAnswers.usage] || userAnswers.usage}`);
      }
      if (userAnswers.preferred_brands?.length > 0) {
        needs.push(`Preferred brands: ${userAnswers.preferred_brands.join(', ')}`);
      }
      if (userAnswers.screen_size) {
        const sizeMap = { compact: 'compact phone (easy one-hand use)', standard: 'standard size', large: 'large screen for media' };
        needs.push(`Screen preference: ${sizeMap[userAnswers.screen_size] || userAnswers.screen_size}`);
      }
      if (userAnswers.longevity) {
        needs.push(`Plans to keep phone for: ${userAnswers.longevity} years`);
      }

      userNeedsText = needs.join('. ') + '.';
    }

    // Build product specs string
    const specsText = [
      `Name: ${product.name}`,
      `Brand: ${product.brand}`,
      product.ram && `RAM: ${product.ram}`,
      product.display && `Display: ${product.display}`,
      product.camera && `Camera: ${product.camera}`,
      product.battery && `Battery: ${product.battery}`,
      product.processor && `Processor: ${product.processor}`,
      product.os && `OS: ${product.os}`,
      product.storage?.length > 0 && `Storage options: ${product.storage.join(', ')}`,
      product.features?.length > 0 && `Key features: ${product.features.join(', ')}`,
      `Best price: ₹${bestPrice.toLocaleString('en-IN')} on ${bestPlatform}`,
    ].filter(Boolean).join('\n');

    // Score context
    const scores = product.scores || {};
    const scoreText = Object.entries(scores)
      .filter(([, v]) => v >= 8)
      .map(([k, v]) => `${k} (${v}/10)`)
      .join(', ');

    let prompt;
    let maxTokens = 200;

    if (inDetail) {
      maxTokens = 800;
      prompt = `You are an expert tech advisor helping an Indian consumer decide whether to buy a phone or laptop.

CUSTOMER PROFILE:
${userNeedsText}

PRODUCT SPECS:
${specsText}

PRODUCT STRENGTHS (rated 8+/10): ${scoreText || 'balanced all-rounder'}

PRODUCT TAGS: ${product.tags?.join(', ') || 'general'}

YOUR TASK:
Provide a highly detailed, comprehensive, and engaging breakdown of this product's specifications and capabilities. Structure your response with the following sections using emojis:
- 📱 Display & Design
- ⚡ Performance & Software
- 📸 Cameras
- 🔋 Battery & Charging
- 💡 Final Verdict

Rules:
- Give concrete numbers and explain what they actually mean for the user based on their profile.
- Write in an engaging, easy-to-read style using bullet points where appropriate.
- Be honest. Discuss both strengths and weaknesses.
- Do NOT output markdown headers (# or ##), just use bold text (**Text**) and emojis for section titles.
- Keep it highly informative but not overly academic.`;
    } else {
      prompt = `You are an expert tech advisor helping an Indian consumer decide whether to buy a phone or laptop.

CUSTOMER PROFILE:
${userNeedsText}

PRODUCT SPECS:
${specsText}

PRODUCT STRENGTHS (rated 8+/10): ${scoreText || 'balanced all-rounder'}

PRODUCT TAGS: ${product.tags?.join(', ') || 'general'}

YOUR TASK:
Write exactly 3 short, personalized sentences (no bullet points, no headers) that explain:
1. Sentence 1: Why this product specifically matches the customer's TOP stated priority or use case. Be concrete — mention the actual spec that helps them.
2. Sentence 2: One honest tradeoff or thing they should know — even if slightly negative. This builds trust. If there are no real downsides for their use case, mention a context where it shines even more.
3. Sentence 3: A confident final verdict: "Buy it if..." or "Skip it if..." that is directly tied to their profile.

Rules:
- Never mention competitor products by name
- Use Indian context (mentions like "long shifts", "hostel", "India trips", etc. if relevant)
- Keep each sentence under 30 words
- Be direct, warm, and honest — not salesy
- If user has no stated preferences, write a general but still useful 3-sentence summary`;
    }

    // Call Groq API (free)
if (!process.env.GROQ_API_KEY) {
  console.log('❌ No GROQ_API_KEY found in .env');
  return res.json({ success: true, summary: null });
}

console.log('🤖 Calling Groq API...');

const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
  },
  body: JSON.stringify({
    model: 'llama-3.1-8b-instant',
    max_tokens: maxTokens,
    temperature: 0.7,
    messages: [
      {
        role: 'system',
        content: 'You are a sharp, honest tech advisor helping Indian consumers buy the right phone or laptop. Be direct, warm, and specific. Never be salesy.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
  }),
});

const data = await response.json();
console.log('Groq response status:', response.status);

if (data.error) {
  console.error('❌ Groq error:', data.error);
  return res.json({ success: true, summary: null, error: data.error.message });
}

const summary = data.choices?.[0]?.message?.content?.trim() || null;
console.log('✅ Summary generated:', summary?.substring(0, 80) + '...');
    res.json({ success: true, summary });
  } catch (error) {
    console.error('Error in getPersonalizedSummary:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getPersonalizedSummary };
