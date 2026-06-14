console.log("MarketEdge Probability Engine Loaded");

function getData() {
  return {
    regime: "risk_off",

    sentiment: {
      fear: 0.7,
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

// REGIME WEIGHTS
function getWeights(regime) {

  if (regime === "inflation_focus") {
    return { cpi: 2.2, nfp: 1.0 };
  }

  if (regime === "growth_focus") {
    return { cpi: 1.0, nfp: 2.2 };
  }

  return { cpi: 1.5, nfp: 1.5 };
}

// SCORING
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

// SENTIMENT IMPACT
function sentimentBoost(fear) {
  if (fear > 0.7) return 1.3;
  if (fear > 0.4) return 1.1;
  return 1.0;
}

// PROBABILITY CONVERSION (NEW CORE LOGIC)
function toProbability(score) {
  // converts engine score into probability space (0–100)
  return Math.min(95, Math.max(5, score * 12.5));
}

// FINAL ENGINE
function riskFilter(nfpScore, cpiScore, weights, sentiment, minutes) {

  let raw =
    (cpiScore * weights.cpi) +
    (nfpScore * weights.nfp);

  let decayed = timeDecay(raw, minutes);

  let adjusted = decayed * sentimentBoost(sentiment.fear);

  let usdStrengthProb = toProbability(adjusted);
  let usdWeaknessProb = 100 - usdStrengthProb;

  let bias = "";
  let context = "";

  if (usdStrengthProb >= 65) {
    bias = "USD STRONG BIAS";
    context = "High probability USD strength";
  }
  else if (usdStrengthProb >= 55) {
    bias = "USD MODERATE BIAS";
    context = "Slight edge USD strength";
  }
  else if (usdStrengthProb >= 45) {
    bias = "NO EDGE";
    context = "Market balanced";
  }
  else {
    bias = "USD WEAK BIAS";
    context = "Higher probability USD weakness";
  }

  return {
    bias,
    context,
    usdStrengthProb: usdStrengthProb.toFixed(1),
    usdWeaknessProb: usdWeaknessProb.toFixed(1)
  };
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
      "PROBABILITY ENGINE ACTIVE";

    document.getElementById("nfp").innerText =
      `NFP Score: ${nfp}`;

    document.getElementById("cpi").innerText =
      `CPI Score: ${cpi}`;

    document.getElementById("bias").innerText =
      `${result.bias} | ${result.context}`;

    document.getElementById("gold").innerText =
      `USD Strength: ${result.usdStrengthProb}% | USD Weak: ${result.usdWeaknessProb}%`;

  } catch (e) {
    document.getElementById("status").innerText =
      "ENGINE ERROR: " + e.message;
  }
}

run();
