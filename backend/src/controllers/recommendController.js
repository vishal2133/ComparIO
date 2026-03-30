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
    if (!process.env.CLAUDE_API_KEY) return null;

    const productList = products
      .map((p, i) => {
        const price = '₹' + p.bestPrice.toLocaleString('en-IN');
        return `${i + 1}. ${p.name} — ${price} on ${p.bestPlatform}`;
      })
      .join('\n');

    const prompt = `User needs a ${userNeeds.category} under ₹${Number(userNeeds.budget).toLocaleString('en-IN')}.
Top priorities: ${userNeeds.priorities.join(', ')}.
Usage: ${userNeeds.usage?.join(', ') || 'general'}.

Top 3 matches found:
${productList}

Write a very brief 3-sentence shopping recommendation. Mention the top pick and why it fits. Be friendly and direct.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 150,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    return data.content?.[0]?.text || null;

  } catch (err) {
    console.log('Claude API skipped:', err.message);
    return null;
  }
};

module.exports = { getRecommendations };