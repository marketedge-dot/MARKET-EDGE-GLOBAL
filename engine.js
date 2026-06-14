console.log("MarketEdge FRED Connected Engine Loaded");

// ⚠️ YOUR FRED API KEY (keep private in real deployment)
const FRED_API_KEY = "PASTE_YOUR_KEY_HERE";

// ===============================
// FETCH REAL CPI FROM FRED
// ===============================
async function fetchCPI() {
  try {

    const url =
      "https://api.stlouisfed.org/fred/series/observations" +
      "?series_id=CPIAUCSL" +
      "&api_key=" + FRED_API_KEY +
      "&file_type=json" +
      "&sort_order=desc" +
      "&limit=5";

    const res = await fetch(url);
    const data = await res.json();

    if (!data.observations || data.observations.length === 0) {
      throw new Error("No CPI data received");
    }

    const latest = data.observations[0].value;

    return parseFloat(latest);

  } catch (e) {
    console.error("CPI fetch error:", e);
    return null;
  }
}

// ===============================
// SAFE HANDLER
// ===============================
function safe(v, fallback = 0) {
  return v === null || v === undefined ? fallback : v;
}

// ===============================
// ENGINE INPUT
// ===============================
async function getData() {

  const cpiValue = await fetchCPI();

  return {
    regime: "risk_off",

    sentiment: {
      fear: 0.65,
      greed: 0.35
    },

    nfp: {
      actual: null,
      expected: null
    },

    cpi: {
      actual: cpiValue,
      expected: null
    },

    timestamp: Date.now()
  };
}

// ===============================
// SURPRISE MODEL (future ready)
// ===============================
function surprise(actual, expected) {
  return safe(actual) - safe(expected);
}

// ===============================
// WEIGHTS BY REGIME
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
// CPI SCORING (REAL DATA MODE)
// ===============================
function scoreCPI(cpi) {

  let value = safe(cpi.actual);

  // simplified inflation pressure mapping
  if (value >= 4.0) return 1; // high inflation = USD pressure risk
  if (value >= 3.0) return 2;
  if (value >= 2.0) return 3;
  return 4; // low inflation = USD strong
}

// ===============================
// NFP PLACEHOLDER
// ===============================
function scoreNFP(nfp) {
  return 2; // neutral until real API added
}

// ===============================
// TIME DECAY
// ===============================
function timeDecay(score, minutes) {
  if (minutes < 5) return score * 1.25;
  if (minutes < 30) return score;
  if (minutes < 120) return score * 0.7;
  return score * 0.4;
}

// ===============================
// SENTIMENT BOOST
// ===============================
function sentimentBoost(fear) {
  if (fear > 0.7) return 1.3;
  if (fear > 0.4) return 1.1;
  return 1.0;
}

// ===============================
// MAIN ENGINE
// ===============================
function riskFilter(cpiScore, weights, sentiment, minutes) {

  let raw = cpiScore * weights.cpi;

  let decayed = timeDecay(raw, minutes);

  let adjusted = decayed * sentimentBoost(sentiment.fear);

  let usdStrengthProb = Math.min(95, Math.max(5, adjusted * 15));
  let usdWeakProb = 100 - usdStrengthProb;

  let bias = "";
  let context = "";

  if (usdStrengthProb >= 65) {
    bias = "USD STRONG BIAS";
    context = "Low inflation supports USD strength";
  }
  else if (usdStrengthProb >= 55) {
    bias = "USD MODERATE BIAS";
    context = "Mild macro support";
  }
  else if (usdStrengthProb >= 45) {
    bias = "NO CLEAR EDGE";
    context = "Market balanced";
  }
  else {
    bias = "USD WEAK BIAS";
    context = "High inflation pressure weakens USD";
  }

  return {
    bias,
    context,
    usdStrengthProb: usdStrengthProb.toFixed(1),
    usdWeakProb: usdWeakProb.toFixed(1),
    cpi: cpiScore
  };
}

// ===============================
// RUN ENGINE
// ===============================
async function run() {

  try {

    const data = await getData();

    const weights = getWeights(data.regime);

    const cpiScore = scoreCPI(data.cpi);
    const nfpScore = scoreNFP(data.nfp);

    const result = riskFilter(
      cpiScore,
      weights,
      data.sentiment,
      12
    );

    document.getElementById("status").innerText =
      "MARKETEDGE LIVE CPI ENGINE ACTIVE";

    document.getElementById("nfp").innerText =
      `NFP: Waiting for API integration`;

    document.getElementById("cpi").innerText =
      `CPI (FRED): ${data.cpi.actual}`;

    document.getElementById("bias").innerText =
      `${result.bias} | ${result.context}`;

    document.getElementById("gold").innerText =
      `USD Strength: ${result.usdStrengthProb}% | USD Weak: ${result.usdWeakProb}%`;

  } catch (e) {
    document.getElementById("status").innerText =
      "ENGINE ERROR: " + e.message;
  }
}

run();
