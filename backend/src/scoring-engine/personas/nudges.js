module.exports = {
  battery_heavy_user: { battery: 0.12 }, battery_light_user: { battery: 0.05 }, battery_power_bank: { battery: -0.05 },
  display_vivid_gaming: { display: 0.15 }, display_reading: { display: -0.05 }, display_not_priority: { display: -0.08 },
  storage_heavy_user: { performance: 0.08, battery: 0.05 }, storage_light_user: { performance: -0.03, battery: -0.03 },
  size_compact: { design: 0.12 }, size_big: { design: -0.08, display: 0.05 },
  durability_high: { design: 0.15 }, durability_low: { design: -0.08 },
  software_1_2_years: { performance: 0.05 }, software_3_4_years: { battery: 0.08 }, software_5_plus_years: { battery: 0.12, design: 0.08 },
  gaming_critical: { performance: 0.15, display: 0.08 }, gaming_casual: { performance: 0.05 }, gaming_never: { performance: -0.10 },
  photo_professional: { camera: 0.20 }, photo_casual: { camera: 0.08 }, photo_never: { camera: -0.15 },
  refresh_yes: { display: 0.10 }, refresh_maybe: { display: 0.03 }, refresh_no: { display: -0.08 },
  ecosystem_yes: { design: 0.08 }, ecosystem_somewhat: { design: 0.03 }, ecosystem_no: { design: -0.05 },
  charging_critical: { battery: 0.10 }, charging_somewhat: { battery: 0.05 }, charging_no: { battery: -0.08 },
  software_stock: { performance: 0.05 }, software_custom: { performance: -0.03 },
};
