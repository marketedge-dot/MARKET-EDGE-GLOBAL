console.log("MarketEdge Engine Loaded");

function getData() {
  return {
    nfp: { value: 180000, previous: 150000 },
    cpi: { value: 3.0, previous: 3.4 }
  };
}

function scoreNFP(nfp) {
  let change = nfp.value - nfp.previous;

  if (change > 20000) return { score: 4, label: "VERY STRONG JOBS" };
  if (change > 0) return { score: 3, label: "POSITIVE JOBS" };
  return { score: 1, label: "WEAK JOBS" };
}

function scoreCPI(cpi) {
  let change = cpi.value - cpi.previous;

  if (change < 0) return { score: 4, label: "DISINFLATION (USD STRONG)" };
  if (change === 0) return { score: 2, label: "STABLE INFLATION" };
  return { score: 1, label: "INFLATION PRESSURE" };
}

// CPI weighted higher than NFP (macro reality)
function riskFilter(nfpScore, cpiScore) {

  let weightedTotal = (cpiScore * 1.5) + (nfpScore * 1.0);

  let bias = "";
  let context = "";

  if (weightedTotal >= 8) {
    bias = "STRONG USD BULLISH";
    context = "CPI-driven macro tightening bias";
  }
  else if (weightedTotal >= 6) {
    bias = "MODERATE USD BULLISH";
    context = "Inflation dominance with labor support";
  }
  else if (weightedTotal >= 4) {
    bias = "NEUTRAL";
    context = "No clear macro dominance";
  }
  else {
    bias = "USD BEARISH";
    context = "Weak macro pressure";
  }

  return { bias, context, weightedTotal };
}

function run() {
  try {

    const data = getData();

    const nfp = scoreNFP(data.nfp);
    const cpi = scoreCPI(data.cpi);

    const result = riskFilter(nfp.score, cpi.score);

    document.getElementById("status").innerText = "MACRO ENGINE ACTIVE";

    document.getElementById("nfp").innerText =
      `${nfp.label} | Score: ${nfp.score}`;

    document.getElementById("cpi").innerText =
      `${cpi.label} | Score: ${cpi.score}`;

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
