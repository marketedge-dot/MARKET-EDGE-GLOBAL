console.log("MarketEdge Sentiment Regime Engine Loaded");

function getData() {
  return {
    regime: "risk_off", // risk_on | risk_off | inflation_focus | growth_focus

    sentiment: {
      fear: 0.7,   // 0 → calm, 1 → panic
      greed: 0.3
    },

    nfp: {
      actual: 180000,
      expected: 150000
    },

    cpi: {
      actual: 3.0,
      expected: 3.3
    },

    timeSinceEventMin: 12
  };
}

// SURPRISE
function surprise(actual, expected) {
  return actual - expected;
}

// REGIME WEIGHTS (CORE LOGIC SHIFT)
function getWeights(regime) {

  if (regime === "inflation_focus") {
    return { cpi: 2.2, nfp: 1.0 };
  }

  if (regime === "growth_focus") {
    return { cpi: 1.0, nfp: 2.2 };
  }

  if (regime === "risk_off") {
    return { cpi: 1.5, nfp: 1.5 };
  }

  return { cpi: 1.5, nfp: 1.5 };
}

// SENTIMENT IMPACT MODIFIER (NEW)
function sentimentModifier(sentiment) {

  let panic = sentiment.fear;

  if (panic > 0.7) return 1.3;   // panic amplifies moves
  if (panic > 0.4) return 1.1;
  return 1.0;
}

// EVENT SCORING
function scoreNFP(nfp) {
  let s = surprise(nfp.actual, nfp.expected);

  if (s > 20000) return 4;
  if (s > 0) return 3;
  return 1;
}

function scoreCPI(cpi) {
  let s = surprise(cpi.actual, cpi.expected);

  if (s < -0.2) return 4;
  if (s < 0) return 3;
  if (s === 0) return 2;
  return 1;
}

// TIME DECAY
function timeDecay(score, minutes) {

  if (minutes < 5) return score * 1.25;
  if (minutes < 30) return score * 1.0;
  if (minutes < 120) return score * 0.7;
  return score * 0.4;
}

// FINAL ENGINE
function riskFilter(nfpScore, cpiScore, weights, sentiment, minutes) {

  let raw =
    (cpiScore * weights.cpi) +
    (nfpScore * weights.nfp);

  let adjusted = timeDecay(raw, minutes);

  // sentiment amplification
  adjusted = adjusted * sentimentModifier(sentiment);

  let bias = "";
  let context = "";

  if (adjusted >= 8) {
    bias = "STRONG USD BULLISH";
    context = "Macro + sentiment aligned";
  }
  else if (adjusted >= 6) {
    bias = "MODERATE USD BULLISH";
    context = "Partial alignment";
  }
  else if (adjusted >= 4) {
    bias = "NEUTRAL";
    context = "Conflicted market";
  }
  else {
    bias = "USD BEARISH";
    context = "Weak macro + sentiment drag";
  }

  return { bias, context, adjusted };
}

// RUN
function run() {
  try {

    const data = getData();

    const weights = getWeights(data.regime);

    const nfp = scoreNFP(data.nfp);
    const cpi = scoreCPI(data.cpi);

    const result = riskFilter(
      nfp,
      cpi,
      weights,
      data.sentiment,
      data.timeSinceEventMin
    );

    document.getElementById("status").innerText =
      "SENTIMENT + REGIME ENGINE ACTIVE";

    document.getElementById("nfp").innerText =
      `NFP Score: ${nfp}`;

    document.getElementById("cpi").innerText =
      `CPI Score: ${cpi}`;

    document.getElementById("bias").innerText =
      `${result.bias} | ${result.context}`;

    document.getElementById("gold").innerText =
      result.bias.includes("BULLISH")
        ? "XAUUSD → DOWN 🔻 (USD STRENGTH)"
        : "XAUUSD → UP 🔺 (USD WEAKNESS)";

  } catch (e) {
    document.getElementById("status").innerText =
      "ENGINE ERROR: " + e.message;
  }
}

run();
