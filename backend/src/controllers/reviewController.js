const axios = require('axios');
const Product = require('../models/Product');
const { scrapeAmazonReviews, scrapeFlipkartReviews } = require('../scrapers/reviews');

// ── ANALYSIS HELPERS ──────────────────────────────────────────────────────────

const analyseReviewPatterns = (reviews) => {
  if (!reviews || reviews.length === 0) return null;

  const total = reviews.length;

  // Rating distribution
  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(r => { ratingDist[r.rating] = (ratingDist[r.rating] || 0) + 1; });

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(1);
  const fiveStarPct = Math.round((ratingDist[5] / total) * 100);
  const oneStarPct = Math.round((ratingDist[1] / total) * 100);
  const verifiedPct = Math.round((reviews.filter(r => r.verified).length / total) * 100);

  // Detect short reviews (possible fake)
  const shortReviews = reviews.filter(r => r.body.length < 50);
  const shortPct = Math.round((shortReviews.length / total) * 100);

  // Detect repeated phrases
  const bodies = reviews.map(r => r.body.toLowerCase());
  const phrases = {};
  bodies.forEach(body => {
    const words = body.split(/\s+/);
    for (let i = 0; i < words.length - 3; i++) {
      const phrase = words.slice(i, i + 4).join(' ');
      phrases[phrase] = (phrases[phrase] || 0) + 1;
    }
  });

  const repeatedPhrases = Object.entries(phrases)
    .filter(([phrase, count]) => count >= 3 && phrase.length > 15)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase, count]) => ({ phrase, count }));

  // Generic words check
  const genericWords = ['good', 'great', 'nice', 'excellent', 'best', 'amazing', 'perfect', 'awesome'];
  const genericReviews = reviews.filter(r => {
    const wordCount = r.body.split(/\s+/).length;
    const body = r.body.toLowerCase();
    const hasGenericOnly = genericWords.some(w => body.includes(w)) &&
      wordCount < 15;
    return hasGenericOnly;
  });
  const genericPct = Math.round((genericReviews.length / total) * 100);

  // Date clustering (many reviews on same day = suspicious)
  const dateCounts = {};
  reviews.forEach(r => {
    if (r.date) {
      const d = r.date.substring(0, 20);
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    }
  });
  const maxSameDay = Math.max(...Object.values(dateCounts));
  const dateClustering = maxSameDay >= 5;

  // Red flags
  const redFlags = [];
  if (fiveStarPct > 80) redFlags.push({ flag: 'Unusually high 5-star ratio', severity: 'high', detail: `${fiveStarPct}% of reviews are 5 stars` });
  if (verifiedPct < 40) redFlags.push({ flag: 'Low verified purchase rate', severity: 'high', detail: `Only ${verifiedPct}% are verified buyers` });
  if (shortPct > 40) redFlags.push({ flag: 'Many suspiciously short reviews', severity: 'medium', detail: `${shortPct}% of reviews are under 50 characters` });
  if (genericPct > 30) redFlags.push({ flag: 'High generic language usage', severity: 'medium', detail: `${genericPct}% use vague, generic praise` });
  if (repeatedPhrases.length >= 3) redFlags.push({ flag: 'Repeated phrases detected', severity: 'high', detail: `Same phrases appear in multiple reviews` });
  if (dateClustering) redFlags.push({ flag: 'Review date clustering', severity: 'medium', detail: `${maxSameDay} reviews posted on the same day` });
  if (oneStarPct < 2 && total > 20) redFlags.push({ flag: 'Suspiciously no negative reviews', severity: 'low', detail: 'Real products always have some negative feedback' });

  // Calculate trust score
  let trustScore = 100;
  redFlags.forEach(flag => {
    if (flag.severity === 'high') trustScore -= 20;
    if (flag.severity === 'medium') trustScore -= 10;
    if (flag.severity === 'low') trustScore -= 5;
  });
  trustScore = Math.max(0, Math.min(100, trustScore));

  return {
    total,
    avgRating: parseFloat(avgRating),
    ratingDist,
    fiveStarPct,
    oneStarPct,
    verifiedPct,
    shortPct,
    genericPct,
    repeatedPhrases,
    dateClustering,
    redFlags,
    trustScore,
    sampleReviews: reviews.slice(0, 10).map(r => ({
      title: r.title,
      body: r.body.substring(0, 200),
      rating: r.rating,
      verified: r.verified,
      date: r.date,
    })),
  };
};

// ── AI VERDICT ────────────────────────────────────────────────────────────────

const getAIVerdict = async (stats, productName) => {
  try {
    if (!process.env.GROQ_API_KEY) return null;

    const prompt = `You are a review authenticity expert for ComparIO, an Indian price comparison site.

Analyse these review statistics for "${productName}":
- Total reviews analysed: ${stats.total}
- Average rating: ${stats.avgRating}/5
- 5-star percentage: ${stats.fiveStarPct}%
- 1-star percentage: ${stats.oneStarPct}%
- Verified purchases: ${stats.verifiedPct}%
- Short/lazy reviews: ${stats.shortPct}%
- Generic language reviews: ${stats.genericPct}%
- Repeated phrases found: ${stats.repeatedPhrases.length}
- Date clustering detected: ${stats.dateClustering}
- Trust Score (our algorithm): ${stats.trustScore}/100
- Red flags found: ${stats.redFlags.map(f => f.flag).join(', ') || 'None'}

Sample reviews:
${stats.sampleReviews.slice(0, 5).map((r, i) =>
  `${i + 1}. [${r.rating}★] ${r.verified ? '✓Verified' : '✗Unverified'} "${r.title}" — "${r.body.substring(0, 100)}"`
).join('\n')}

Write exactly 3 short sentences:
1. An honest verdict on review authenticity (mention the trust score)
2. The most important red flag (or green flag if reviews seem genuine)
3. A practical buying advice for an Indian consumer based on this analysis

Be direct, India-centric, and use simple language. No bullet points.`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-8b-instant',
        max_tokens: 180,
        temperature: 0.4,
        messages: [
          { role: 'system', content: 'You are a concise review fraud expert. Give honest, direct verdicts in 3 sentences max.' },
          { role: 'user', content: prompt },
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

    return response.data.choices?.[0]?.message?.content?.trim() || null;

  } catch (err) {
    console.log('AI verdict skipped:', err.message);
    return null;
  }
};

// ── MAIN CONTROLLER ───────────────────────────────────────────────────────────

const analyseReviews = async (req, res) => {
  try {
    const { slug, platform } = req.body;

    if (!slug) {
      return res.status(400).json({ success: false, message: 'slug required' });
    }

    const product = await Product.findOne({ slug });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Find the URL for the requested platform
    const priceEntry = product.prices.find(p =>
      platform ? p.platform === platform : true
    );

    if (!priceEntry || !priceEntry.affiliateUrl) {
      return res.status(400).json({
        success: false,
        message: 'No product URL found for this platform',
      });
    }

    // Check if we have a cached analysis less than 24 hours old
    if (product.reviewAnalysis &&
      product.reviewAnalysis.platform === priceEntry.platform &&
      product.reviewAnalysis.analyzedAt &&
      Date.now() - new Date(product.reviewAnalysis.analyzedAt).getTime() < 24 * 60 * 60 * 1000) {
      console.log('📋 Returning cached review analysis');
      return res.json({
        success: true,
        cached: true,
        data: product.reviewAnalysis,
        productName: product.name,
      });
    }

    console.log(`\n🔍 Analysing reviews for ${product.name} on ${priceEntry.platform}`);

    // Scrape reviews
    let reviews = null;
    if (priceEntry.platform === 'amazon') {
      reviews = await scrapeAmazonReviews(priceEntry.affiliateUrl, 100);
    } else if (priceEntry.platform === 'flipkart') {
      reviews = await scrapeFlipkartReviews(priceEntry.affiliateUrl, 100);
    }

    if (!reviews || reviews.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not fetch reviews. The product URL may be incorrect or the platform blocked access.',
      });
    }

    // Analyse patterns
    const stats = analyseReviewPatterns(reviews);
    if (!stats) {
      return res.status(400).json({ success: false, message: 'Analysis failed' });
    }

    // Get AI verdict
    const aiVerdict = await getAIVerdict(stats, product.name);

    // Build verdict label
    let verdict, verdictColor;
    if (stats.trustScore >= 75) { verdict = 'Mostly Genuine'; verdictColor = 'green'; }
    else if (stats.trustScore >= 50) { verdict = 'Mixed Signals'; verdictColor = 'amber'; }
    else { verdict = 'Suspicious Activity'; verdictColor = 'red'; }

    const analysis = {
      platform: priceEntry.platform,
      productName: product.name,
      trustScore: stats.trustScore,
      verdict,
      verdictColor,
      stats: {
        total: stats.total,
        avgRating: stats.avgRating,
        ratingDist: stats.ratingDist,
        fiveStarPct: stats.fiveStarPct,
        oneStarPct: stats.oneStarPct,
        verifiedPct: stats.verifiedPct,
        shortPct: stats.shortPct,
        genericPct: stats.genericPct,
        dateClustering: stats.dateClustering,
      },
      redFlags: stats.redFlags,
      repeatedPhrases: stats.repeatedPhrases,
      aiVerdict,
      sampleReviews: stats.sampleReviews,
      analyzedAt: new Date(),
    };

    // Cache on product document
    await Product.findByIdAndUpdate(product._id, {
      $set: { reviewAnalysis: analysis },
    });

    console.log(`✅ Analysis complete — Trust Score: ${stats.trustScore}/100 (${verdict})`);

    res.json({
      success: true,
      cached: false,
      data: analysis,
      productName: product.name,
    });

  } catch (err) {
    console.error('Review analysis error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { analyseReviews };