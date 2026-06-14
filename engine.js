<!DOCTYPE html>
<html>
<head>
  <title>MarketEdge Macro Pro</title>
  <style>
    body {
      margin: 0;
      font-family: Arial;
      background: #0b0f1a;
      color: white;
    }

    .topbar {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      background: #11182a;
    }

    .menu {
      font-size: 24px;
      cursor: pointer;
    }

    .dropdown {
      position: absolute;
      right: 10px;
      top: 50px;
      background: #1a2338;
      display: none;
      flex-direction: column;
      padding: 10px;
      border-radius: 10px;
    }

    .dropdown button {
      background: none;
      border: none;
      color: white;
      padding: 10px;
      text-align: left;
      cursor: pointer;
    }

    .card {
      margin: 15px;
      padding: 15px;
      background: #121a2e;
      border-radius: 10px;
    }

    .big {
      font-size: 22px;
      font-weight: bold;
    }
  </style>
</head>

<body>

<div class="topbar">
  <div>MarketEdge</div>
  <div class="menu" onclick="toggleMenu()">⋮</div>
</div>

<div class="dropdown" id="menu">
  <button onclick="show('dashboard')">Dashboard</button>
  <button onclick="show('cpi')">CPI Module</button>
  <button onclick="show('nfp')">NFP Module</button>
</div>

<!-- DASHBOARD -->
<div id="dashboard" class="page">

  <div class="card">
    <div class="big">MACRO BIAS</div>
    <div id="bias">Loading...</div>
  </div>

  <div class="card">
    Risk Level: <span id="risk">MEDIUM</span>
  </div>

</div>

<!-- CPI -->
<div id="cpi" class="page" style="display:none">

  <div class="card">
    <div class="big">CPI ANALYSIS</div>
    <div id="cpiValue">Loading...</div>
  </div>

</div>

<!-- NFP -->
<div id="nfp" class="page" style="display:none">

  <div class="card">
    <div class="big">NFP ANALYSIS</div>
    <div id="nfpValue">Loading...</div>
  </div>

</div>

<script>

// ===================== STATE =====================
let state = {
  cpi: 3.2,
  nfp: 180000
};

// ===================== NAV =====================
function toggleMenu() {
  let m = document.getElementById("menu");
  m.style.display = m.style.display === "flex" ? "none" : "flex";
}

function show(page) {
  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(page).style.display = "block";
  document.getElementById("menu").style.display = "none";
}

// ===================== CPI MODEL =====================
function cpiModel(cpi) {

  if (cpi >= 4.0) {
    return { label: "HIGH INFLATION", bias: "USD NEGATIVE", score: 1 };
  }

  if (cpi >= 3.0) {
    return { label: "ELEVATED INFLATION", bias: "SLIGHT USD WEAK", score: 2 };
  }

  if (cpi >= 2.0) {
    return { label: "STABLE INFLATION", bias: "NEUTRAL", score: 3 };
  }

  return { label: "LOW INFLATION", bias: "USD STRONG", score: 4 };
}

// ===================== NFP MODEL =====================
function nfpModel(nfp) {

  if (nfp > 220000) {
    return { label: "VERY STRONG JOBS", bias: "USD STRONG", score: 4 };
  }

  if (nfp > 180000) {
    return { label: "STRONG JOBS", bias: "USD SUPPORTIVE", score: 3 };
  }

  if (nfp > 120000) {
    return { label: "MODERATE JOBS", bias: "NEUTRAL", score: 2 };
  }

  return { label: "WEAK JOBS", bias: "USD WEAK", score: 1 };
}

// ===================== MACRO ENGINE =====================
function macroEngine(cpi, nfp) {

  const cpiData = cpiModel(cpi);
  const nfpData = nfpModel(nfp);

  let combined = cpiData.score + nfpData.score;

  let bias =
    combined >= 7 ? "USD STRONG BIAS"
    : combined >= 5 ? "MODERATE BIAS"
    : combined >= 3 ? "NO CLEAR EDGE"
    : "USD WEAK BIAS";

  return {
    cpiData,
    nfpData,
    bias
  };
}

// ===================== UI ENGINE =====================
function calculate() {

  const macro = macroEngine(state.cpi, state.nfp);

  document.getElementById("bias").innerText =
    macro.bias;

  document.getElementById("risk").innerText =
    macro.bias.includes("STRONG") || macro.bias.includes("WEAK")
      ? "HIGH"
      : "MEDIUM";

  document.getElementById("cpiValue").innerText =
    macro.cpiData.label + " | " + macro.cpiData.bias;

  document.getElementById("nfpValue").innerText =
    macro.nfpData.label + " | " + macro.nfpData.bias;
}

calculate();

</script>

</body>
</html>
