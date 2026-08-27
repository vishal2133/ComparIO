const { parseSpecs } = require('../ml/scoreEngine');
const { computeFinalWeights } = require('./personas/compute');
const { computeCategoryScores } = require('./category-scores');

const scoreKeys = ['performance', 'camera', 'battery', 'display', 'design'];
const num = value => {
  const match = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
};
const bestPrice = product => Math.min(...(product.prices || []).map(p => p.price).filter(Number.isFinite));
const specSource = product => product.fullSpecs || product.parsedSpecs || {};

function categoryScoresFor(product) {
  const saved = product.categoryScores;
  if (saved && scoreKeys.every(key => Number.isFinite(saved[key]))) return saved;
  return computeCategoryScores(product);
}

function factsFor(product) {
  const parsed = parseSpecs(specSource(product));
  const raw = product.parsedSpecs || {};
  return {
    has5g: parsed.has5G || /5g/i.test(JSON.stringify(raw)),
    hasSdCard: /expandable|micro.?sd|memory card/i.test(JSON.stringify(raw)),
    ip: parsed.ip || num(raw.extra?.ipRating || raw.design?.waterResistance),
    charging: parsed.wattCharging || num(raw.battery?.fastCharging || raw.battery?.chargingSpeed),
    weight: parsed.weightG || num(raw.design?.weight || raw.weight),
    thickness: num(raw.design?.thickness || raw.thickness),
    updateYears: num(raw.extra?.softwareUpdates || raw.technical?.softwareUpdates),
  };
}

const budgetBands = {
  '15k': [0, 15000], '15_25k': [15000, 25000], '25_40k': [25000, 40000],
  '40_70k': [40000, 70000], '70k_plus': [70000, Infinity],
};

function passesHardFilters(product, answers) {
  const price = bestPrice(product);
  const band = budgetBands[answers.budget];
  if (!Number.isFinite(price) || (band && (price < band[0] || price > band[1]))) return false;
  if (answers.brand_preference && answers.brand_preference !== 'no_preference'
    && String(product.brand || '').toLowerCase() !== String(answers.brand_preference).toLowerCase()) return false;
  const facts = factsFor(product);
  return !(answers.dealbreakers || []).some(rule => (
    (rule === '5G' && !facts.has5g)
    || (rule === 'expandable_storage' && !facts.hasSdCard)
    || (rule === 'ip_rating' && facts.ip < 53)
    || (rule === 'fast_charging' && facts.charging < 30)
    || (rule === 'compact_design' && (facts.weight > 200 || facts.thickness > 9))
    || (rule === 'software_updates' && facts.updateYears < 3)
  ));
}

function scoreProduct(product, weights) {
  const categoryScores = categoryScoresFor(product);
  const score_breakdown = Object.fromEntries(scoreKeys.map(key => [key, +(categoryScores[key] * weights[key]).toFixed(2)]));
  const matched_score = +Object.values(score_breakdown).reduce((sum, value) => sum + value, 0).toFixed(1);
  const top_strengths = [...scoreKeys].sort((a, b) => categoryScores[b] - categoryScores[a]).slice(0, 2)
    .map(category => ({ category, score: categoryScores[category] }));
  const price = bestPrice(product);
  const priceEntry = (product.prices || []).find(item => item.price === price);
  return { ...product.toObject(), categoryScores, matched_score, score_breakdown, top_strengths, bestPrice: price, bestPlatform: priceEntry?.platform || null };
}

async function getRecommendations(answers, Product) {
  const products = await Product.find({ category: 'phone' });
  const filtered = products.filter(product => passesHardFilters(product, answers));
  const weights = computeFinalWeights(answers);
  const ranked = filtered.map(product => scoreProduct(product, weights)).sort((a, b) => b.matched_score - a.matched_score);
  const persona = answers.use_case || 'all_rounder';
  const weight_emphasis = Object.entries(weights).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([key, value]) => `${key} (${Math.round(value * 100)}%)`);
  return { top_picks: ranked.slice(0, answers.extended_set_completed ? 5 : 3), all_scored: ranked, total_matches: ranked.length, your_persona: { primary: persona, weight_emphasis, weights } };
}

module.exports = { categoryScoresFor, computeCategoryScores, getRecommendations, passesHardFilters };
