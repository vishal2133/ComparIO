// ── PARSER ────────────────────────────────────────────────────────────────────
const parseSpecs = (s) => {
  if (!s) return {};
  const p = {};

  const num  = (str, regex) => { const m = str?.match(regex); return m ? parseFloat(m[1]) : null; };
  const has  = (str, ...words) => words.some(w => str?.toLowerCase().includes(w.toLowerCase()));
  const bool = (val) => !!(val && !String(val).toLowerCase().includes('no') && String(val).trim() !== '');

  // Camera
  p.mainMP        = num(s.mainCamera, /(\d+)\s*MP/i) || num(s.mainCameraAperture, /(\d+)\s*MP/i);
  p.aperture      = num(s.mainCamera || s.mainCameraAperture, /f\/(\d+\.?\d*)/i);
  p.sensorSize    = num(s.mainCamera, /1\/(\d+\.?\d*)/i); // lower = bigger sensor
  p.hasOIS        = has(s.mainCamera || '', 'ois') || bool(s.mainCameraOIS);
  p.has8K         = has(s.mainCameraVideo || '', '8k', '8K');
  p.has4K60       = has(s.mainCameraVideo || '', '4k') && has(s.mainCameraVideo || '', '60');
  p.has4K30       = has(s.mainCameraVideo || '', '4k');
  p.zoomX         = num(s.telephotoCamera, /(\d+)x/i) || 0;
  p.hasPeriscope  = has(s.telephotoCamera || '', 'periscope');
  p.frontMP       = num(s.frontCamera, /(\d+)\s*MP/i);

  // Battery
  p.mAh           = num(s.batteryCapacity, /(\d+)\s*mAh/i);
  p.wattCharging  = num(s.chargingSpeed, /(\d+)\s*W/i);
  p.hasWireless   = bool(s.wirelessCharging);

  // Display
  p.hz            = num(s.displayRefreshRate, /(\d+)\s*Hz/i) || 60;
  p.nits          = num(s.displayBrightness, /(\d+)\s*nits/i);
  p.isAMOLED      = has(s.displayType || '', 'amoled', 'oled');
  p.isLTPO        = has(s.displayType || '', 'ltpo');
  const res       = s.displayResolution?.match(/(\d+)\s*[xX×]\s*(\d+)/);
  p.pixels        = res ? parseInt(res[1]) * parseInt(res[2]) : null;
  p.screenIn      = num(s.displaySize, /(\d+\.?\d*)\s*[""'']/);

  // Performance
  p.ramGB         = num(s.ram, /(\d+)\s*GB/i);
  const proc      = (s.processor || '').toLowerCase();
  p.chipTier = proc.match(/snapdragon 8 gen [34]|a1[678] |a17|a18|dimensity 9[23456]00|tensor g[34]/i)
    ? 'flagship'
    : proc.match(/snapdragon 7[0-9]|dimensity 8[0-9]|snapdragon 8 gen [12]/i) ? 'upper_mid'
    : proc.match(/snapdragon 6[0-9]|dimensity 7[0-9]|helio g99/i) ? 'mid'
    : proc.match(/snapdragon 4[0-9]|dimensity 6[0-9]|helio g[0-9]/i) ? 'budget'
    : 'unknown';

  // Build
  p.weightG       = num(s.weight, /(\d+)\s*g(?:rams?)?/i);
  const ip        = (s.waterResistance || '').match(/ip(\d+)/i);
  p.ip            = ip ? parseInt(ip[1]) : 0;
  p.hasGorilla    = has(s.displayProtection || '', 'gorilla');
  p.gorillaVictus = has(s.displayProtection || '', 'victus');
  p.has5G         = has(s.network || s.sim || '', '5g');
  p.hasNFC        = bool(s.nfc);
  p.hasJack       = bool(s.headphoneJack);
  p.hasIR         = bool(s.irBlaster);

  return p;
};

// ── INDIVIDUAL SCORERS ────────────────────────────────────────────────────────

const scoreCamera = (p) => {
  let s = 0;

  // Megapixels (diminishing returns)
  s += p.mainMP >= 200 ? 1.8 : p.mainMP >= 100 ? 1.6 : p.mainMP >= 50 ? 1.4
     : p.mainMP >= 32 ? 1.1 : p.mainMP >= 12 ? 0.9 : 0.5;

  // Aperture — lower = better low light
  s += !p.aperture ? 1.0
     : p.aperture <= 1.5 ? 2.0 : p.aperture <= 1.7 ? 1.8 : p.aperture <= 1.8 ? 1.5
     : p.aperture <= 2.0 ? 1.2 : 0.8;

  // Sensor size — lower number = BIGGER sensor = better
  s += !p.sensorSize ? 1.0
     : p.sensorSize <= 1.3 ? 2.0 : p.sensorSize <= 1.5 ? 1.8 : p.sensorSize <= 1.7 ? 1.5
     : p.sensorSize <= 2.0 ? 1.2 : 0.8;

  // OIS
  s += p.hasOIS ? 0.8 : 0;

  // Video
  s += p.has8K ? 0.7 : p.has4K60 ? 0.5 : p.has4K30 ? 0.3 : 0;

  // Telephoto / zoom
  s += p.hasPeriscope ? 1.0 : p.zoomX >= 5 ? 0.8 : p.zoomX >= 3 ? 0.5 : p.zoomX >= 2 ? 0.3 : 0;

  // Front camera
  s += p.frontMP >= 50 ? 0.5 : p.frontMP >= 32 ? 0.4 : p.frontMP >= 20 ? 0.3 : 0.2;

  return +(Math.min(10, Math.max(1, s))).toFixed(1);
};

const scoreBattery = (p) => {
  let s = 0;

  // mAh — Indian buyers keep phones longer, value big batteries
  s += p.mAh >= 6000 ? 4.0 : p.mAh >= 5500 ? 3.7 : p.mAh >= 5000 ? 3.3
     : p.mAh >= 4500 ? 2.8 : p.mAh >= 4000 ? 2.3 : p.mAh >= 3500 ? 1.8 : 1.0;

  // Charging speed
  s += p.wattCharging >= 120 ? 3.5 : p.wattCharging >= 100 ? 3.2 : p.wattCharging >= 80 ? 3.0
     : p.wattCharging >= 65 ? 2.6 : p.wattCharging >= 45 ? 2.2 : p.wattCharging >= 30 ? 1.8
     : p.wattCharging >= 20 ? 1.3 : 0.8;

  // Wireless
  s += p.hasWireless ? 1.0 : 0;

  // Efficiency bonus
  s += (p.mAh >= 5000 && p.chipTier === 'flagship') ? 0.5 : 0;
  s += (p.mAh >= 5000 && p.chipTier === 'upper_mid') ? 0.3 : 0;

  return +(Math.min(10, Math.max(1, s))).toFixed(1);
};

const scoreDisplay = (p) => {
  let s = 0;

  // Panel type
  s += p.isAMOLED ? 2.5 : 1.0;
  s += p.isLTPO ? 0.8 : 0;

  // Refresh rate
  s += p.hz >= 165 ? 2.5 : p.hz >= 144 ? 2.2 : p.hz >= 120 ? 2.0
     : p.hz >= 90 ? 1.5 : 0.8;

  // Brightness — India-specific boost (sunlight visibility is critical)
  s += p.nits >= 4000 ? 2.5 : p.nits >= 2000 ? 2.1 : p.nits >= 1500 ? 1.8
     : p.nits >= 1000 ? 1.4 : p.nits >= 800 ? 1.0 : 0.6;

  // Resolution
  s += p.pixels >= 4000000 ? 1.0 : p.pixels >= 2000000 ? 0.8 : 0.5;

  // Screen size
  s += p.screenIn >= 6.7 ? 0.4 : p.screenIn >= 6.4 ? 0.3 : 0.2;

  return +(Math.min(10, Math.max(1, s))).toFixed(1);
};

const scorePerformance = (p) => {
  let s = 0;

  // Chip tier
  const tierScore = { flagship: 4.5, upper_mid: 3.5, mid: 2.5, budget: 1.5, unknown: 2.0 };
  s += tierScore[p.chipTier] || 2.0;

  // RAM
  s += p.ramGB >= 16 ? 3.5 : p.ramGB >= 12 ? 3.0 : p.ramGB >= 8 ? 2.5
     : p.ramGB >= 6 ? 2.0 : 1.2;

  // Bonus for flagship chip + LTPO combo
  s += (p.isLTPO && p.chipTier === 'flagship') ? 0.5 : 0;

  s += 1.0; // base quality score

  return +(Math.min(10, Math.max(1, s))).toFixed(1);
};

const scoreBuild = (p) => {
  let s = 0;

  // IP rating
  s += p.ip >= 68 ? 3.0 : p.ip >= 67 ? 2.2 : p.ip >= 65 ? 1.5 : p.ip >= 54 ? 0.8 : 0;

  // Glass protection
  s += p.gorillaVictus ? 2.0 : p.hasGorilla ? 1.5 : 0.5;

  // Weight — lighter is more portable but not always better
  s += !p.weightG ? 1.5
     : p.weightG <= 165 ? 2.5 : p.weightG <= 180 ? 2.2 : p.weightG <= 195 ? 1.8
     : p.weightG <= 210 ? 1.4 : 1.0;

  // Useful extras
  s += p.hasNFC ? 0.5 : 0;
  s += p.has5G ? 1.0 : 0;
  s += p.hasJack ? 0.5 : 0; // Headphone jack still valued in India
  s += p.hasIR ? 0.3 : 0;

  return +(Math.min(10, Math.max(1, s))).toFixed(1);
};

const scoreValue = (scores, priceINR) => {
  const avg = (scores.camera + scores.battery + scores.display + scores.performance + scores.build) / 5;
  // Value = quality per rupee — normalised to 10
  const priceEfficiency = Math.max(1, 10 - (priceINR / 18000));
  return +(Math.min(10, Math.max(1, (avg * 0.65) + (priceEfficiency * 0.35)))).toFixed(1);
};

const scorePortability = (p) => {
  if (!p.weightG) return 6.0;
  return +(Math.min(10, Math.max(1, 10 - ((p.weightG - 150) / 15)))).toFixed(1);
};

// ── CAMERA SUB-SCORES ─────────────────────────────────────────────────────────

const cameraSubScores = (p) => ({
  nightPhotography: +(Math.min(10, Math.max(1,
    (!p.aperture ? 1.5 : p.aperture <= 1.5 ? 4 : p.aperture <= 1.7 ? 3.5 : p.aperture <= 1.8 ? 3 : 2) +
    (!p.sensorSize ? 2 : p.sensorSize <= 1.3 ? 3.5 : p.sensorSize <= 1.5 ? 3 : p.sensorSize <= 1.7 ? 2.5 : 1.8) +
    (p.hasOIS ? 2 : 0)
  ))).toFixed(1),

  selfiePortrait: +(Math.min(10, Math.max(1,
    (p.frontMP >= 50 ? 4 : p.frontMP >= 32 ? 3.5 : p.frontMP >= 20 ? 3 : 2) +
    (p.has4K60 ? 2.5 : p.has4K30 ? 2 : 1) +
    3 // base modern phone selfie quality
  ))).toFixed(1),

  opticalZoom: +(Math.min(10, Math.max(1,
    (p.hasPeriscope ? 4.5 : 0) +
    (p.zoomX >= 10 ? 5 : p.zoomX >= 5 ? 4 : p.zoomX >= 3 ? 3 : p.zoomX >= 2 ? 2 : 0.5) +
    1
  ))).toFixed(1),

  videography: +(Math.min(10, Math.max(1,
    (p.has8K ? 3 : p.has4K60 ? 2.5 : p.has4K30 ? 2 : 1) +
    (p.hasOIS ? 2.5 : 0) +
    (p.chipTier === 'flagship' ? 2.5 : p.chipTier === 'upper_mid' ? 2 : 1.5) +
    1.5
  ))).toFixed(1),

  everydayShots: +(Math.min(10, Math.max(1,
    (p.mainMP >= 50 ? 3 : p.mainMP >= 32 ? 2.5 : 2) +
    (p.hasOIS ? 2 : 0) +
    (p.aperture <= 1.8 ? 2 : 1.5) +
    2.5
  ))).toFixed(1),
});

// ── MAIN EXPORT ───────────────────────────────────────────────────────────────

const generateScores = (product) => {
  const p = parseSpecs(product.fullSpecs);
  const price = product.prices?.length
    ? Math.min(...product.prices.map(pr => pr.price))
    : 50000;

  const scores = {
    camera:      scoreCamera(p),
    battery:     scoreBattery(p),
    display:     scoreDisplay(p),
    performance: scorePerformance(p),
    build:       scoreBuild(p),
    value:       0, // calculated below
    portability: scorePortability(p),
  };

  scores.value = scoreValue(scores, price);

  const camera = cameraSubScores(p);

  return { scores, camera, parsedSpecs: p };
};

module.exports = { generateScores, parseSpecs };
