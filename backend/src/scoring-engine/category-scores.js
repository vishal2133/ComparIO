const { parseSpecs } = require('../ml/scoreEngine');

const clamp = value => +Math.min(10, Math.max(1, value)).toFixed(1);
const number = value => Number(String(value || '').replace(',', '').match(/\d+(?:\.\d+)?/)?.[0] || 0);
const tierScore = { flagship: 9.5, upper_mid: 7.7, mid: 6.1, budget: 4.3, unknown: 5.5 };

function allSpecs(product) {
  return { ...(product.fullSpecs || {}), ...(product.parsedSpecs || {}), ...(product.toObject ? product.toObject() : product) };
}

function computeCategoryScores(product) {
  const specs = allSpecs(product);
  const p = parseSpecs(specs);
  const ram = p.ramGB || number(specs.ram || specs.memory?.ram);
  const performance = clamp((tierScore[p.chipTier] * 0.68) + ((ram >= 16 ? 10 : ram >= 12 ? 8.8 : ram >= 8 ? 7.4 : ram >= 6 ? 6.1 : 4.5) * 0.32));
  const mp = p.mainMP || number(specs.mainCamera || specs.camera?.rearCamera);
  const cameraBase = mp >= 200 ? 9 : mp >= 108 ? 8.5 : mp >= 64 ? 7.7 : mp >= 48 ? 7.1 : 5.5;
  const camera = clamp(cameraBase + (p.hasOIS ? 0.8 : 0) + (p.has4K60 ? 0.6 : p.has4K30 ? 0.3 : 0) + (p.aperture && p.aperture <= 1.8 ? 0.4 : 0));
  const capacity = p.mAh || number(specs.batteryCapacity || specs.battery?.capacity);
  const watts = p.wattCharging || number(specs.chargingSpeed || specs.battery?.fastCharging);
  const capacityScore = capacity >= 6000 ? 10 : capacity >= 5500 ? 9.1 : capacity >= 5000 ? 8.2 : capacity >= 4500 ? 7.3 : capacity >= 4000 ? 6.5 : 5;
  const chargingScore = watts >= 120 ? 10 : watts >= 65 ? 9.3 : watts >= 45 ? 8.4 : watts >= 30 ? 7 : 5;
  const efficiency = p.chipTier === 'flagship' ? 8.5 : p.chipTier === 'upper_mid' ? 8 : p.chipTier === 'mid' ? 7 : 6;
  const battery = clamp((capacityScore * 0.45) + (efficiency * 0.35) + (chargingScore * 0.20));
  const brightness = p.nits || number(specs.displayBrightness || specs.display?.brightness);
  const refresh = p.hz || number(specs.displayRefreshRate || specs.display?.refreshRate) || 60;
  const panel = String(specs.displayType || specs.display?.type || '').toLowerCase();
  const display = clamp(((refresh >= 120 ? 9.5 : refresh >= 90 ? 7.8 : 5.8) * 0.35) + ((brightness >= 2000 ? 9.5 : brightness >= 1200 ? 8.3 : brightness >= 800 ? 7.1 : 5.8) * 0.25) + ((/amoled|oled/.test(panel) ? 9.5 : /ips/.test(panel) ? 7 : 6.5) * 0.15) + ((p.pixels >= 2500000 ? 9 : p.pixels >= 1900000 ? 7.8 : 6.5) * 0.25));
  const weight = p.weightG || number(specs.weight || specs.design?.weight);
  const ip = p.ip || number(specs.waterResistance || specs.design?.waterResistance);
  const thickness = number(specs.thickness || specs.design?.thickness);
  const material = String(specs.buildMaterial || specs.design?.buildMaterial || '').toLowerCase();
  const design = clamp(((weight && weight <= 180 ? 9 : weight && weight <= 200 ? 7.5 : 6) * 0.25) + ((thickness && thickness <= 8 ? 9 : thickness && thickness <= 9 ? 7.5 : 6) * 0.15) + ((ip >= 68 ? 9.5 : ip >= 67 ? 8.5 : ip >= 53 ? 7 : 5) * 0.35) + ((/glass|alumin|metal|titanium/.test(material) ? 8.5 : 6) * 0.25));
  return { performance, camera, battery, display, design };
}

module.exports = { computeCategoryScores };
