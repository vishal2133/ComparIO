# Quiz and Scoring Implementation

## Flow

1. Ask the eight core questions: budget, brand preference, display, storage/RAM, size, durability, longevity, and current phone.
2. Return three ranked recommendations.
3. Offer optional fine-tuning with gaming, photography, refresh rate, ecosystem, charging, and software-style questions.
4. Return five final recommendations after fine-tuning.

## Answer Mapping

| Quiz answer | Recommendation effect |
|---|---|
| Budget | Hard-filters products to the selected price band |
| Brand preference | Optional hard filter; custom brands are supported |
| Display | Adjusts display weight |
| Storage/RAM | Adjusts performance and battery weights |
| Size | Adjusts design and display weights |
| Durability | Adjusts design weight |
| Longevity | Adjusts battery and design weights |
| Current phone | Personalisation only; no score change |
| Gaming / photography / refresh / ecosystem / charging | Fine-tunes performance, camera, display, design, or battery |
| Software style | Captured for future software-experience scoring; stock UI currently gives a small performance preference |

## Scoring

Phones receive pre-computable 0–10 category scores for performance, camera, battery, display, and design. At recommendation time, quiz answer weights are normalized to sum to 1.0 and multiplied by each phone's category scores. The legacy recommendation endpoint remains unchanged.

## Operations

Run `node backend/src/scoring-engine/backfill.js` once after deployment to populate `categoryScores` for existing phone records.
