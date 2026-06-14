console.log("MarketEdge Event Engine Loaded");

function getData() {
  return {
    nfp: {
      actual: 180000,
      expected: 150000,
      previous: 150000
    },
    cpi: {
      actual: 3.0,
      expected: 3.3,
      previous: 3.4
    }
  };
}

// SURPRISE = ACTUAL - EXPECTED (this is what moves markets)
function surprise(actual, expected) {
  return actual - expected;
}

function scoreNFP(nfp) {
  let s = surprise(nfp.actual, nfp.expected);

  if (s > 20000) return { score: 4, label: "VERY STRONG JOBS SURPRISE" };
  if (s > 0) return { score: 3, label: "POSITIVE JOBS SURPRISE" };
  return { score: 1, label: "NEGATIVE JOBS SURPRISE" };
}

function scoreCPI(cpi) {
  let s = surprise(cpi.actual, cpi.expected);

  if (s < -0.2) return { score: 4, label: "DISINFLATION SURPRISE (USD STRONG)" };
  if (s < 0) return { score: 3, label: "SLIGHTLY LOWER INFLATION" };
  if (s === 0) return { score: 2, label: "IN-LINE INFLATION" };
  return { score: 1, label: "HOT INFLATION SURPRISE" };
}

function riskFilter(nfpScore, cpiScore) {

  let total = (cpiScore * 1.5) + (nfpScore * 1.0);

  if (total >= 8) return { bias: "STRONG USD BULLISH", context: "Inflation-led regime" };
  if (total >= 6) return { bias: "MODERATE USD BULLISH", context: "Mixed macro strength" };
  if (total >= 4) return { bias: "NEUTRAL", context: "No dominance" };
  return { bias: "USD BEARISH", context: "Weak macro pressure" };
}

function run() {
  try {

    const data = getData();

    const nfp = scoreNFP(data.nfp);
    const cpi = scoreCPI(data.cpi);

    const result = riskFilter(nfp.score, cpi.score);

    document.getElementById("status").innerText = "EVENT-DRIVEN ENGINE ACTIVE";

    document.getElementById("nfp").innerText =
      `${nfp.label}`;

    document.getElementById("cpi").innerText =
      `${cpi.label}`;

    document.getElementById("bias").innerText =
      `${result.bias} | ${result.context}`;

    document.getElementById("gold").innerText =
      result.bias.includes("BULLISH")
        ? "XAUUSD → DOWN 🔻 (USD STRONG)"
        : "XAUUSD → UP 🔺 (USD WEAK)";

  } catch (e) {
    document.getElementById("status").innerText =
      "ENGINE ERROR: " + e.message;
  }
}

run();
