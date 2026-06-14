function getData() {
  return {
    nfp: { value: 175000, previous: 150000 },
    cpi: { value: 3.1, previous: 3.4 }
  };
}

function scoreNFP(nfp) {
  let change = nfp.value - nfp.previous;
  if (change > 20000) return { score: 3, label: "VERY STRONG JOBS" };
  if (change > 0) return { score: 2, label: "POSITIVE JOBS" };
  return { score: 1, label: "WEAK JOBS" };
}

function scoreCPI(cpi) {
  let change = cpi.value - cpi.previous;
  if (change < 0) return { score: 3, label: "DISINFLATION (USD STRONG)" };
  if (change === 0) return { score: 2, label: "STABLE INFLATION" };
  return { score: 1, label: "INFLATION PRESSURE" };
}

function getBias(total) {
  if (total >= 5) return "STRONG USD BULLISH";
  if (total === 4) return "MODERATE USD BULLISH";
  if (total === 3) return "NEUTRAL";
  return "USD BEARISH";
}

function run() {

  const data = getData();

  const nfp = scoreNFP(data.nfp);
  const cpi = scoreCPI(data.cpi);

  const total = nfp.score + cpi.score;
  const bias = getBias(total);

  document.getElementById("status").innerText = "ENGINE ACTIVE";

  document.getElementById("nfp").innerText =
    nfp.label + " | Score: " + nfp.score;

  document.getElementById("cpi").innerText =
    cpi.label + " | Score: " + cpi.score;

  document.getElementById("bias").innerText = bias;

  document.getElementById("gold").innerText =
    bias.includes("BULLISH")
      ? "XAUUSD → DOWN 🔻"
      : "XAUUSD → UP 🔺";
}

run();
