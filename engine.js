console.log("MarketEdge Surprise + Volatility Engine Loaded");

// ===============================
// DATA (LIVE + EXPECTATIONS)
// ===============================
async function getData() {
  return {
    regime: "inflation_focus",

    sentiment: {
      fear: 0.65
    },

    // CPI (FRED REAL)
    cpi: {
      actual: await fetchCPI(),
      expected: 3.3
    },

    // NFP (BLS REAL)
    nfp: {
      actual: await fetchNFP()
    }
  };
}

// ===============================
// CPI FETCH (FRED)
// ===============================
const FRED_API_KEY = "PASTE_KEY_HERE";

async function fetchCPI() {
  try {
    const url =
      "https://api.stlouisfed.org/fred/series/observations" +
      "?series_id=CPIAUCSL&api_key=" + FRED_API_KEY +
      "&file_type=json&sort_order=desc&limit=1";

    const res = await fetch(url);
    const data = await res.json();

    return parseFloat(data.observations[0].value);
  } catch {
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
    const series = data.Results.series[0].data;

    return parseFloat(series[0].value);
  } catch {
    return null;
  }
}

// ===============================
// SURPRISE ENGINE (CORE EDGE)
// ===============================
function surprise(actual, expected) {

  if (actual === null || expected === null) return 0;

  return actual - expected;
}

// ===============================
// VOLATILITY ENGINE
// ===============================
function volatility(score, sentimentFear) {

  let base = Math.abs(score);

  let fearBoost = sentimentFear > 0.7 ? 1.5 : 1.0;

  let vol = base * fearBoost;

  if (vol > 2.0) return "HIGH VOLATILITY SPIKE (NEWS MOVE)";
  if (vol > 1.0) return "MEDIUM VOLATILITY";
  return "LOW VOLATILITY";
}

// ===============================
// CPI MODEL
// ===============================
function cpiImpact(cpi) {

  let s = surprise(cpi.actual, cpi.expected);

  if (s > 0.3) return -2; // inflation higher → USD negative
  if (s > 0) return -1;
  if (s === 0) return 0;
  return 2; // inflation lower → USD positive
}

// ===============================
// NFP MODEL
// ===============================
function nfpImpact(nfp) {

  if (nfp.actual > 200000) return 2;
  if (nfp.actual > 0) return 1;
  return -2;
}

// ===============================
// MAIN ENGINE
// ===============================
function runEngine(data) {

  let cpiScore = cpiImpact(data.cpi);
  let nfpScore = nfpImpact(data.nfp);

  let combined = cpiScore + nfpScore;

  let bias =
    combined > 1 ? "USD STRONG REACTION BIAS" :
    combined < -1 ? "USD WEAK REACTION BIAS" :
    "RANGE / WHIPSAW RISK";

  let vol = volatility(combined, data.sentiment.fear);

  return {
    bias,
    score: combined,
    volatility: vol
  };
}

// ===============================
// RUN
// ===============================
async function run() {

  const data = await getData();

  const result = runEngine(data);

  document.getElementById("status").innerText =
    "MARKETEDGE SURPRISE ENGINE ACTIVE";

  document.getElementById("cpi").innerText =
    `CPI: ${data.cpi.actual} (Exp: ${data.cpi.expected})`;

  document.getElementById("nfp").innerText =
    `NFP: ${data.nfp.actual}`;

  document.getElementById("bias").innerText =
    result.bias;

  document.getElementById("gold").innerText =
    `Score: ${result.score} | ${result.volatility}`;
}

run();
