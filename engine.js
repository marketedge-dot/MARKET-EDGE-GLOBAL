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

function riskFilter(total) {
  if (total >= 7) {
    return { bias: "STRONG USD BULLISH", risk: "HIGH CONFIDENCE" };
  }
  if (total >= 5) {
    return { bias: "MODERATE USD BULLISH", risk: "MEDIUM CONFIDENCE" };
  }
  if (total >= 3) {
    return { bias: "NEUTRAL", risk: "NO TRADE ZONE" };
  }
  return { bias: "USD BEARISH", risk: "REVERSAL WATCH" };
}

function run() {
  try {
    const data = getData();

    const nfp = scoreNFP(data.nfp);
    const cpi = scoreCPI(data.cpi);

    const total = nfp.score + cpi.score;

    const result = riskFilter(total);

    document.getElementById("status").innerText = "ENGINE ACTIVE";

    document.getElementById("nfp").innerText =
      `${nfp.label} | Score: ${nfp.score}`;

    document.getElementById("cpi").innerText =
      `${cpi.label} | Score: ${cpi.score}`;

    document.getElementById("bias").innerText =
      `${result.bias} (${result.risk})`;

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
