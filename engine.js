function scoreNFP(nfp) {
  let s = nfp.surprise;

  if (s > 25000) return { score: 4, label: "VERY STRONG JOBS" };
  if (s > 10000) return { score: 3, label: "STRONG JOBS" };
  if (s > 0) return { score: 2, label: "SLIGHTLY POSITIVE" };
  return { score: 1, label: "WEAK JOBS" };
}

function scoreCPI(cpi) {
  let s = cpi.surprise;

  if (s < -0.3) return { score: 4, label: "DISINFLATION (USD VERY STRONG)" };
  if (s < 0) return { score: 3, label: "DISINFLATION" };
  if (s === 0) return { score: 2, label: "STABLE INFLATION" };
  return { score: 1, label: "INFLATION PRESSURE" };
}
