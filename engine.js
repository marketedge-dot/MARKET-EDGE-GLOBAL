function getData() {
  return {
    nfp: {
      value: 180000,
      previous: 150000,
      surprise: 30000,
      timestamp: Date.now()
    },
    cpi: {
      value: 3.0,
      previous: 3.4,
      surprise: -0.4,
      timestamp: Date.now()
    },
    context: {
      usd_strength: 0,
      risk_sentiment: "neutral"
    }
  };
}
