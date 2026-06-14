console.log("MarketEdge Pre-News Macro Engine Loaded");

// ===============================
// CONFIG
// ===============================
const FRED_API_KEY = "PASTE_YOUR_FRED_KEY_HERE";

// ===============================
// CPI FETCH (FRED)
// ===============================
async function fetchCPI() {
  try {
    const url =
      "https://api.stlouisfed.org/fred/series/observations" +
      "?series_id=CPIAUCSL" +
      "&api_key=" + FRED_API_KEY +
      "&file_type=json&sort_order=desc&limit=2";

    const res = await fetch(url);
    const data = await res.json();

    return parseFloat(data.observations[0].value);

  } catch (e) {
    console.error("CPI error:", e);
    return null;
  }
}

// ===============================
// NFP FETCH (BLS)
// ===============================
async function fetchNFP() {
  try {

    const res = await fetch("https://api.bls.gov/publicAPI/v2/timeseries/data/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seriesid: ["CES0000000001"],
        startyear: "2024",
        endyear: "2025"
      })
    });

    const data = await res.json();
    const series = data?.Results?.series?.[0]?.data;

    const latest = parseFloat(series[0].value);
    const previous = parseFloat(series[1].value);

    return { actual: latest, previous: previous };

  } catch (e) {
    console.error("NFP error:", e);
    return { actual: null, previous: null };
  }
}

// ===============================
// SAFE VALUE
// ===============================
function safe(v) {
  return v === null || v === undefined ? 0 : v;
}

// ===============================
// DATA LOADER
// ===============================
async function getData() {

  const cpi = await fetchCPI();
  const nfp = await fetchNFP();

  return {
    regime: "inflation_focus",

    sentiment: {
      fear: 0.65,
      greed: 0.35
    },

    cpi: {
      actual: cpi
    },

    nfp: {
      actual: nfp.actual,
      previous: nfp.previous
    },

    timestamp: Date.now()
  };
}

// ===============================
// CPI MODEL
// ===============================
function scoreCPI(cpi) {

  let v = safe(cpi.actual);

  if (v >= 4.0) return 1; // high inflation
  if (v >= 3.0) return 2;
  if (v >= 2.0) return 3;
  return 4; // low inflation = USD strong environment
}

// ===============================
// NFP MODEL
// ===============================
function scoreNFP(nfp) {

  let change = safe(nfp.actual) - safe(nfp.previous);

  if (change > 200) return 4;
  if (change > 0) return 3;
  return 1;
}

// ===============================
// REGIME WEIGHTS
// ===============================
function getWeights(regime) {

  if (regime === "inflation_focus") {
    return { cpi: 2.2, nfp: 1.0 };
  }

  if (regime === "growth_focus") {
    return { cpi: 1.0, nfp: 2.2 };
  }

  return { cpi: 1.5, nfp: 1.5 };
}

// ===============================
// PRE-NEWS GOAL ZONES (IMPORTANT PART)
// ===============================

// CPI goal ranges (market expectation zones)
function cpiGoal(cpi) {

  if (cpi >= 4.0) return "HIGH INFLATION ZONE";
  if (cpi >= 3.0) return "ELEVATED INFLATION ZONE";
  if (cpi >= 2.0) return "STABLE INFLATION ZONE";
  return "LOW INFLATION ZONE (USD SUPPORTIVE)";
}

// NFP goal ranges
function nfpGoal(nfp) {

  let change = safe(nfp.actual) - safe(nfp.previous);

  if (change > 200) return "STRONG JOBS GROWTH ZONE";
  if (change > 0) return "MODERATE JOBS GROWTH ZONE";
  return "WEAK JOBS ZONE";
}

// ===============================
// SENTIMENT IMPACT
// ===============================
function sentimentBoost(fear) {
  if (fear > 0.7) return 1.3;
  if (fear > 0.4) return 1.1;
  return 1.0;
}

// ===============================
// MAIN ENGINE (PRE-NEWS BIAS MODEL)
// ===============================
function riskFilter(cpiScore, nfpScore, weights, sentiment) {

  let raw =
    (cpiScore * weights.cpi) +
    (nfpScore * weights.nfp);

  let adjusted = raw * sentimentBoost(sentiment.fear);

  let usdProb = Math.min(95, Math.max(5, adjusted * 12));

  let bias =
    usdProb >= 60 ? "USD BULLISH PRE-BIAS" :
    usdProb <= 40 ? "USD BEARISH PRE-BIAS" :
    "NO CLEAR PRE-BIAS";

  return {
    bias,
    usdStrength: usdProb.toFixed(1),
    usdWeak: (100 - usdProb).toFixed(1)
  };
}

// ===============================
// RUN ENGINE
// ===============================
async function run() {

  const data = await getData();

  const weights = getWeights(data.regime);

  const cpiScore = scoreCPI(data.cpi);
  const nfpScore = scoreNFP(data.nfp);

  const result = riskFilter(
    cpiScore,
    nfpScore,
    weights,
    data.sentiment
  );

  document.getElementById("status").innerText =
    "MARKETEDGE PRE-NEWS ENGINE ACTIVE";

  document.getElementById("cpi").innerText =
    `CPI: ${data.cpi.actual} | ${cpiGoal(data.cpi)}`;

  document.getElementById("nfp").innerText =
    `NFP: ${data.nfp.actual} | ${nfpGoal(data.nfp)}`;

  document.getElementById("bias").innerText =
    `${result.bias}`;

  document.getElementById("gold").innerText =
    `USD Strength ${result.usdStrength}% | USD Weak ${result.usdWeak}%`;
}

run();
