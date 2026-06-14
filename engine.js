console.log("MarketEdge Macro Reality Engine Loaded");

function getData() {
  return {
    regime: "inflation_focus", // can be: inflation_focus | growth_focus | risk_off

    nfp: {
      actual: 180000,
      expected: 150000
    },

    cpi: {
      actual: 3.0,
      expected: 3.3
    }
  };
}

// SURPRISE CORE
function surprise(actual, expected) {
  return actual - expected;
}

// REGIME WEIGHTING (THIS IS THE REAL IMPROVEMENT)
function getWeights(regime) {

  if (regime === "inflation_focus") {
    return { cpi: 2.0, nfp: 1.0 };
  }

  if (regime === "growth_focus") {
    return { cpi: 1.0, nfp: 2.0 };
  }

  return { cpi: 1.5, nfp: 1.5 }; // risk_off / neutral
}

// NFP SCORE
function scoreNFP(nfp) {
  let s = surprise(nfp.actual, nfp.expected);

  if (s > 20000) return { score: 4, label: "STRONG JOBS SURPRISE" };
  if (s > 0) return { score: 3, label: "POSITIVE JOBS SURPRISE" };
  return { score: 1, label: "WEAK JOBS SURPRISE" };
}

// CPI SCORE
function scoreCPI(cpi) {
  let s = surprise(cpi.actual, cpi.expected);

  if (s < -0.2) return { score: 4, label: "DISINFLATION (USD STRONG)" };
  if (s < 0) return { score: 3, label: "LOWER INFLATION" };
  if (s === 0) return { score: 2, label: "IN-LINE INFLATION" };
  return { score: 1, label: "HOT INFLATION" };
}

// FINAL DECISION ENGINE
function riskFilter(nfpScore, cpiScore, weights) {

  let weighted =
    (cpiScore * weights.cpi) +
    (nfpScore * weights.nfp);

  let bias = "";
  let context = "";

  if (weighted >= 8) {
    bias = "STRONG USD BULLISH";
    context = "Macro dominance detected";
  }
  else if (weighted >= 6) {
    bias = "MODERATE USD BULLISH";
    context = "Mixed macro pressure";
  }
  else if (weighted >= 4) {
    bias = "NEUTRAL";
    context = "No clear regime dominance";
  }
  else {
    bias = "USD BEARISH";
    context = "Weak macro structure";
  }

  return { bias, context, weighted };
}

// RUN ENGINE
function run() {
  try {

    const data = getData();

    const weights = getWeights(data.regime);

    const nfp = scoreNFP(data.nfp);
    const cpi = scoreCPI(data.cpi);

    const result = riskFilter(nfp.score, cpi.score, weights);

    document.getElementById("status").innerText =
      "MACRO REALITY ENGINE ACTIVE";

    document.getElementById("nfp").innerText =
      `${nfp.label}`;

    document.getElementById("cpi").innerText =
      `${cpi.label}`;

    document.getElementById("bias").innerText =
      `${result.bias} | ${result.context}`;

    document.getElementById("gold").innerText =
      result.bias.includes("BULLISH")
        ? "XAUUSD → DOWN 🔻 (USD DOMINANCE)"
        : "XAUUSD → UP 🔺 (USD WEAKNESS)";

  } catch (e) {
    document.getElementById("status").innerText =
      "ENGINE ERROR: " + e.message;
  }
}

run();
