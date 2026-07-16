const Product    = require('../models/Product');
const { scrapeSmartprixSpecs } = require('../scrapers/smartprix');
const { generateScores }       = require('../ml/scoreEngine');

// ── SCRAPE + PARSE + SCORE + STORE — ONE PRODUCT ─────────────────────────────
const scrapeAndStoreSpecs = async (req, res) => {
  try {
    const { slug, smartprixUrl, force = false } = req.body;

    const product = await Product.findOne({ slug });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.specsComplete && !force) {
      return res.json({
        success: true, cached: true,
        message: 'Already done — specs stored permanently',
        data: { scores: product.scores, cameraSubScores: product.cameraSubScores },
      });
    }

    const result = await scrapeSmartprixSpecs(product.name, smartprixUrl || null);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.error });
    }

    // Generate all scores from parsed specs
    const { scores, camera, parsedSpecs } = generateScores({
      fullSpecs: result.fullSpecs,
      prices: product.prices,
    });

    // Store EVERYTHING permanently — never scrape again
    await Product.findByIdAndUpdate(product._id, {
      $set: {
        fullSpecs:        result.fullSpecs,
        parsedSpecs,
        scores,
        cameraSubScores:  camera,
        specsComplete:    true,
        ...(result.pageImage && !product.image ? { image: result.pageImage } : {}),
      },
    });

    console.log(`\n✅ STORED FOREVER: ${product.name}`);
    console.log(`   Scores: Camera ${scores.camera} | Battery ${scores.battery} | Display ${scores.display} | Perf ${scores.performance} | Build ${scores.build} | Value ${scores.value}`);
    console.log(`   Camera breakdown: Night ${camera.nightPhotography} | Selfie ${camera.selfiePortrait} | Zoom ${camera.opticalZoom} | Video ${camera.videography}`);

    res.json({
      success: true,
      message: `Specs + scores stored permanently for ${product.name}`,
      data: {
        rawSpecsFound:  result.rawCount,
        fieldsFilled:   result.filledCount,
        scores,
        cameraSubScores: camera,
        sampleSpecs: {
          processor:     result.fullSpecs.processor,
          ram:           result.fullSpecs.ram,
          battery:       result.fullSpecs.batteryCapacity,
          mainCamera:    result.fullSpecs.mainCamera,
          display:       result.fullSpecs.displayType,
          charging:      result.fullSpecs.chargingSpeed,
          waterResist:   result.fullSpecs.waterResistance,
        },
      },
    });

  } catch (err) {
    console.error('Specs error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── SCRAPE ALL MISSING — RUNS IN BACKGROUND ───────────────────────────────────
const scrapeAllMissingSpecs = async (req, res) => {
  try {
    const products = await Product.find({ specsComplete: false });

    if (products.length === 0) {
      return res.json({ success: true, message: 'All products already have specs!' });
    }

    // Respond immediately — don't make them wait
    res.json({
      success: true,
      message: `Started scraping ${products.length} products in background. Check server logs.`,
      products: products.map(p => p.name),
    });

    // Run in background
    let done = 0, failed = 0;

    for (const product of products) {
      try {
        console.log(`\n[${done + failed + 1}/${products.length}] ${product.name}`);

        const result = await scrapeSmartprixSpecs(product.name);

        if (result.success) {
          const { scores, camera, parsedSpecs } = generateScores({
            fullSpecs: result.fullSpecs,
            prices: product.prices,
          });

          await Product.findByIdAndUpdate(product._id, {
            $set: {
              fullSpecs: result.fullSpecs,
              parsedSpecs, scores,
              cameraSubScores: camera,
              specsComplete: true,
              ...(result.pageImage && !product.image ? { image: result.pageImage } : {}),
            },
          });

          console.log(`   ✅ Done — Camera: ${scores.camera} | Battery: ${scores.battery} | Value: ${scores.value}`);
          done++;
        } else {
          console.log(`   ❌ Failed — ${result.error}`);
          failed++;
        }

        // 4 second pause between products — respect rate limits
        await new Promise(r => setTimeout(r, 4000));

      } catch (err) {
        console.log(`   ❌ Error — ${err.message}`);
        failed++;
      }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`BULK SCRAPE COMPLETE`);
    console.log(`✅ Success: ${done}  ❌ Failed: ${failed}`);
    console.log(`API credits used: ~${done * 1} of 5000 monthly quota`);

  } catch (err) {
    console.error('Bulk scrape error:', err.message);
  }
};

// ── GET SPECS + SCORES ────────────────────────────────────────────────────────
const getSpecs = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .select('name brand fullSpecs parsedSpecs scores cameraSubScores specsComplete');
    if (!product) return res.status(404).json({ success: false });
    res.json({ success: true, specsComplete: product.specsComplete, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── COMPARE TWO PRODUCTS ──────────────────────────────────────────────────────
const compareProducts = async (req, res) => {
  try {
    const { slug1, slug2 } = req.query;
    if (!slug1 || !slug2) return res.status(400).json({ success: false, message: 'Need slug1 and slug2' });

    const [p1, p2] = await Promise.all([
      Product.findOne({ slug: slug1 }),
      Product.findOne({ slug: slug2 }),
    ]);

    if (!p1 || !p2) return res.status(404).json({ success: false, message: 'Product not found' });

    const format = (p) => ({
      name:            p.name,
      brand:           p.brand,
      slug:            p.slug,
      image:           p.image,
      bestPrice:       p.prices?.length ? Math.min(...p.prices.map(pr => pr.price)) : null,
      specsComplete:   p.specsComplete,
      scores:          p.scores || {},
      cameraSubScores: p.cameraSubScores || {},
      specs:           p.fullSpecs || {},
    });

    res.json({ success: true, product1: format(p1), product2: format(p2) });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── RE-SCORE WITHOUT RE-SCRAPING ──────────────────────────────────────────────
// Use this if you improve the scoring algorithm — regenerates scores
// from already-stored specs without spending any API credits
const rescoreAll = async (req, res) => {
  try {
    const products = await Product.find({ specsComplete: true });
    res.json({ message: `Re-scoring ${products.length} products from stored specs...` });

    let done = 0;
    for (const product of products) {
      const { scores, camera, parsedSpecs } = generateScores({
        fullSpecs: product.fullSpecs,
        prices: product.prices,
      });
      await Product.findByIdAndUpdate(product._id, {
        $set: { scores, cameraSubScores: camera, parsedSpecs },
      });
      console.log(`Re-scored: ${product.name} — Camera: ${scores.camera}`);
      done++;
    }
    console.log(`✅ Re-scored ${done} products — no API credits used`);

  } catch (err) {
    console.error('Rescore error:', err.message);
  }
};

module.exports = { scrapeAndStoreSpecs, scrapeAllMissingSpecs, getSpecs, compareProducts, rescoreAll };
