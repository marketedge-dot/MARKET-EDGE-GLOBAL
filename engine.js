function riskFilter(totalScore) {

  if (totalScore >= 7) {
    return {
      bias: "STRONG USD BULLISH",
      risk: "HIGH CONFIDENCE TRADE"
    };
  }

  if (totalScore >= 5) {
    return {
      bias: "MODERATE USD BULLISH",
      risk: "MEDIUM CONFIDENCE"
    };
  }

  if (totalScore >= 3) {
    return {
      bias: "NEUTRAL",
      risk: "NO TRADE ZONE"
    };
  }

  return {
    bias: "USD BEARISH",
    risk: "REVERSAL WATCH"
  };
}
