const Product = require('../models/Product');

const getRecommendations = async (req, res) => {
  try {
    const {
      category,
      budget,
      priorities,
      usage,
      os,
    } = req.body;

    // Step 1 — Filter by category + OS
    const query = { category };
    if (os && os !== 'any') {
      query.os = new RegExp(os, 'i');
    }

    let products = await Product.find(query);

    if (products.length === 0) {
      return res.json({ success: false, message: 'No products found for this category.' });
    }

    // Step 2 — Filter by budget
    const inBudget = products.filter((p) => {
      const bestPrice = Math.min(...p.prices.map((pr) => pr.price));
      return bestPrice <= budget;
    });

    // If less than 3 in budget, relax by 15%
    const candidates = inBudget.length >= 3
      ? inBudget
      : products.filter((p) => {
          const bestPrice = Math.min(...p.prices.map((pr) => pr.price));
          return bestPrice <= budget * 1.15;
        });

    if (candidates.length === 0) {
      return res.json({
        success: false,
        message: 'No products found in this budget. Try increasing your budget.',
      });
    }

    // Step 3 — Score each product based on priorities
    const scored = candidates.map((product) => {
      let score = 0;

      priorities.forEach((priority, index) => {
        const weight = index === 0 ? 3 : index === 1 ? 2 : 1;
        const productScore = product.scores?.[priority] || 5;
        score += productScore * weight;
      });

      // Bonus for usage tag matches
      if (usage && usage.length > 0) {
        const tagMatches = usage.filter((u) => product.tags?.includes(u)).length;
        score += tagMatches * 2;
      }

      // Value bonus for products well under budget
      const bestPrice = Math.min(...product.prices.map((p) => p.price));
      const budgetUsage = bestPrice / budget;
      if (budgetUsage < 0.7) score += 3;
      else if (budgetUsage < 0.85) score += 1;

      return {
        ...product.toObject(),
        recommendScore: score,
        bestPrice: Math.min(...product.prices.map((p) => p.price)),
        bestPlatform: product.prices.reduce((a, b) => (a.price < b.price ? a : b)).platform,
      };
    });

    // Step 4 — Sort by score, take top 3
    const top3 = scored
      .sort((a, b) => b.recommendScore - a.recommendScore)
      .slice(0, 3);

    // Step 5 — Send to Claude for summary
    const summary = await generateClaudeSummary(top3, {
      category, budget, priorities, usage, os,
    });

    res.json({ success: true, data: top3, summary });

  } catch (err) {
    console.error('Recommend error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const generateClaudeSummary = async (products, userNeeds) => {
  try {
    if (!process.env.GROQ_API_KEY) return null;

    const productList = products.map((p, i) => {
      const scores = p.scores || {};
      const topScores = Object.entries(scores)
        .filter(([, v]) => v >= 8)
        .map(([k]) => k)
        .join(', ');
      return `${i + 1}. ${p.name} — ₹${p.bestPrice.toLocaleString('en-IN')} on ${p.bestPlatform} (strengths: ${topScores || 'balanced'})`;
    }).join('\n');

    const priorityMap = {
      camera: 'great camera', battery: 'long battery life',
      gaming: 'gaming performance', charging: 'fast charging',
      display: 'display quality', performance: 'speed',
      build: 'durability', portability: 'portability', value: 'value for money',
    };

    const priorityText = (userNeeds.priorities || [])
      .map(p => priorityMap[p] || p).join(' and ');

    const prompt = `You are a sharp, friendly tech advisor helping an Indian customer pick the best ${userNeeds.category}.

Customer profile:
- Budget: up to ₹${Number(userNeeds.budget).toLocaleString('en-IN')}
- Wants: ${priorityText || 'good overall value'}
- Usage: ${userNeeds.usage?.join(', ') || 'general'}

Top 3 matches:
${productList}

Write exactly 2 sentences:
1. State the #1 pick and why it fits this customer's specific needs.
2. Mention the runner-up as a backup with one key reason.

Be direct. Use Indian context. No bullet points.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 150,
        temperature: 0.7,
        messages: [
          { role: 'system', content: 'You are a concise, helpful tech advisor for Indian consumers.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || null;

  } catch (err) {
    console.log('Groq summary skipped:', err.message);
    return null;
  }
};

module.exports = { getRecommendations };
