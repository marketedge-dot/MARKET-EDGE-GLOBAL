<!DOCTYPE html>
<html>
<head>
  <title>MarketEdge Pro</title>
  <style>
    body {
      font-family: Arial;
      margin: 0;
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
      cursor: pointer;
      font-size: 22px;
    }

    .dropdown {
      position: absolute;
      right: 10px;
      top: 50px;
      background: #1a2338;
      display: none;
      flex-direction: column;
      padding: 10px;
      border-radius: 8px;
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
      background: #121a2e;
      margin: 15px;
      padding: 15px;
      border-radius: 10px;
    }

    .big {
      font-size: 24px;
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
    <div class="big">USD BIAS</div>
    <div id="bias">Loading...</div>
  </div>

  <div class="card">
    Risk Level: <span id="risk">MEDIUM</span>
  </div>

</div>

<!-- CPI -->
<div id="cpi" class="page" style="display:none">

  <div class="card">
    <div class="big">CPI MODULE</div>
    <div>Inflation Level:</div>
    <div id="cpiValue">Loading...</div>
  </div>

</div>

<!-- NFP -->
<div id="nfp" class="page" style="display:none">

  <div class="card">
    <div class="big">NFP MODULE</div>
    <div>Jobs Data:</div>
    <div id="nfpValue">Loading...</div>
  </div>

</div>

<script>

// ================= ENGINE =================

let state = {
  cpi: 3.2,
  nfp: 180000
};

// MENU
function toggleMenu() {
  let m = document.getElementById("menu");
  m.style.display = m.style.display === "flex" ? "none" : "flex";
}

// NAVIGATION
function show(page) {

  document.querySelectorAll(".page").forEach(p => p.style.display = "none");
  document.getElementById(page).style.display = "block";

  document.getElementById("menu").style.display = "none";
}

// SIMPLE ENGINE
function calculate() {

  let bias = "";

  if (state.cpi > 3.5 && state.nfp > 200000) {
    bias = "USD STRONG (Hawkish Economy)";
  }
  else if (state.cpi < 2.5 && state.nfp < 150000) {
    bias = "USD WEAK (Dovish Economy)";
  }
  else {
    bias = "NO CLEAR EDGE";
  }

  document.getElementById("bias").innerText = bias;

  document.getElementById("cpiValue").innerText =
    state.cpi + " (Inflation)";

  document.getElementById("nfpValue").innerText =
    state.nfp + " jobs";

  let risk =
    state.cpi > 3.5 || state.nfp > 220000 ? "HIGH"
    : "MEDIUM";

  document.getElementById("risk").innerText = risk;
}

calculate();

</script>

</body>
</html>
