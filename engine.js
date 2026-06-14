function run() {

  const data = getData();

  const nfp = scoreNFP(data.nfp);
  const cpi = scoreCPI(data.cpi);

  const total = nfp.score + cpi.score;

  const result = riskFilter(total);

  document.getElementById("status").innerText = "REAL ENGINE ACTIVE";

  document.getElementById("nfp").innerText =
    nfp.label + " | Score: " + nfp.score;

  document.getElementById("cpi").innerText =
    cpi.label + " | Score: " + cpi.score;

  document.getElementById("bias").innerText =
    result.bias + " (" + result.risk + ")";

  document.getElementById("gold").innerText =
    result.bias.includes("BULLISH")
      ? "XAUUSD → DOWN 🔻 (USD STRENGTH)"
      : "XAUUSD → UP 🔺 (USD WEAKNESS)";
}

run();
