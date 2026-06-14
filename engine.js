console.log("MarketEdge Reaction Engine Loaded");

function getData() {
  return {
    regime: "inflation_focus",

    // event data
    nfp: {
      actual: 180000,
      expected: 150000
    },

    cpi: {
      actual: 3.0,
      expected: 3.3
    },

    // TIME CONTEXT (NEW IMPORTANT PART)
    timeSinceEventMin: 12 // simulate minutes after release
  };
}

// SURPRISE
function surprise(actual, expected) {
  return actual - expected;
}

// WEIGHTS BASED ON REGIME
function getWeights(regime) {
  if (regime === "inflation_focus") {
    return { cpi: 2.0, nfp: 1.0 };
  }
  if (regime === "growth_focus") {
    return { cpi: 1.0, nfp: 2.0 };
  }
  return { cpi: 1.5, nfp: 1.5 };
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

// TIME DECAY MODEL (THIS IS THE REAL UPGRADE)
function timeDecay(score, minutes) {

  // first reaction = strong
  if (minutes < 5) return score * 1.2;

  // confirmation phase
  if (minutes < 30) return score * 1.0;

  // fading phase
  if (minutes < 120) return score * 0.7;

  // stale phase
  return score * 0.4;
}

// FINAL ENGINE
function riskFilter(nfpScore, cpiScore, weights, minutes) {

  let raw =
    (cpiScore * weights.cpi) +
    (nfpScore * weights.nfp);

  let adjusted = timeDecay(raw, minutes);

  let bias = "";
  let context = "";

  if (adjusted >= 8) {
    bias = "STRONG USD BULLISH";
    context = "Fresh macro shock + confirmation";
  }
  else if (adjusted >= 6) {
    bias = "MODERATE USD BULLISH";
    context = "Active but stabilizing";
  }
  else if (adjusted >= 4) {
    bias = "NEUTRAL";
    context = "Reaction fading";
  }
  else {
    bias = "USD BEARISH";
    context = "Market absorbed shock";
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
      data.timeSinceEventMin
    );

    document.getElementById("status").innerText =
      "REACTION ENGINE ACTIVE";

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
