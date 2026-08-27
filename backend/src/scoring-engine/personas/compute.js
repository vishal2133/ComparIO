const personas = require('./base-personas');
const nudges = require('./nudges');

const answerNudges = (answers) => [
  `battery_${answers.battery}`, `display_${answers.display}`, `storage_${answers.storage}`,
  `size_${answers.size}`, `durability_${answers.durability}`, `software_${answers.software_longevity}`,
  ...(answers.extended_set_completed ? [
    `gaming_${answers.gaming}`, `photo_${answers.photography}`, `refresh_${answers.refresh_rate}`,
    `ecosystem_${answers.ecosystem}`, `charging_${answers.charging}`, `software_${answers.software_ui}`,
  ] : []),
].filter(key => !key.endsWith('_null') && !key.endsWith('_undefined'));

function computeFinalWeights(answers = {}) {
  const persona = personas[answers.use_case] || personas.all_rounder;
  const weights = { ...persona };
  answerNudges(answers).forEach(key => {
    Object.entries(nudges[key] || {}).forEach(([category, amount]) => { weights[category] += amount; });
  });
  Object.keys(weights).forEach(key => { weights[key] = Math.max(0.01, weights[key]); });
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  Object.keys(weights).forEach(key => { weights[key] = +(weights[key] / total).toFixed(4); });
  return weights;
}

module.exports = { computeFinalWeights };
