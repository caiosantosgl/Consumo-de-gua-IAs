// CONFIGURAÇÃO PRINCIPAL
const INTERACTIONS_PER_MINUTE = 35;
const ML_PER_INTERACTION_MIN = 10; // 500 ml / 50 interações
const ML_PER_INTERACTION_MAX = 25; // 500 ml / 20 interações
const OLIMPIC_POOL_LITERS = 2500000;

// ELEMENTOS
const timeDisplay = document.getElementById("timeDisplay");
const elapsedSeconds = document.getElementById("elapsedSeconds");
const interactionsValue = document.getElementById("interactionsValue");
const waterMinLiters = document.getElementById("waterMinLiters");
const waterMaxLiters = document.getElementById("waterMaxLiters");
const waterMinMl = document.getElementById("waterMinMl");
const waterMaxMl = document.getElementById("waterMaxMl");
const bottlesValue = document.getElementById("bottlesValue");
const bucketsValue = document.getElementById("bucketsValue");
const cupsValue = document.getElementById("cupsValue");
const poolsValue = document.getElementById("poolsValue");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const simInput = document.getElementById("simInput");
const simUnit = document.getElementById("simUnit");
const simRate = document.getElementById("simRate");
const calcBtn = document.getElementById("calcBtn");
const simTimeResult = document.getElementById("simTimeResult");
const simInteractions = document.getElementById("simInteractions");
const simWaterMin = document.getElementById("simWaterMin");
const simWaterMax = document.getElementById("simWaterMax");
const simBottles = document.getElementById("simBottles");

// CRONÔMETRO
let running = false;
let startTime = 0;
let elapsedBeforePause = 0;
let rafId = null;

function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0")
  ].join(":");
}

function formatNumberBR(value, maxDecimals = 0) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals
  }).format(value);
}

function formatLitersFromMl(ml) {
  const liters = ml / 1000;
  if (liters < 1) return `${formatNumberBR(ml, 0)} ml`;
  return `${formatNumberBR(liters, 2)} L`;
}

function calculateImpact(seconds, interactionsPerMinute = INTERACTIONS_PER_MINUTE) {
  const interactions = (seconds / 60) * interactionsPerMinute;
  const minMl = interactions * ML_PER_INTERACTION_MIN;
  const maxMl = interactions * ML_PER_INTERACTION_MAX;

  return {
    interactions,
    minMl,
    maxMl,
    bottles500: maxMl / 500,
    buckets10L: maxMl / 10000,
    cups250: maxMl / 250,
    pools: (maxMl / 1000) / OLIMPIC_POOL_LITERS
  };
}

function updateLiveData(ms) {
  const seconds = Math.floor(ms / 1000);
  const data = calculateImpact(seconds);

  timeDisplay.textContent = formatTime(ms);
  elapsedSeconds.textContent = `${formatNumberBR(seconds)}s`;
  interactionsValue.textContent = formatNumberBR(data.interactions, 0);

  waterMinMl.textContent = formatLitersFromMl(data.minMl);
  waterMaxMl.textContent = formatLitersFromMl(data.maxMl);

  waterMinLiters.textContent = `${formatNumberBR(data.minMl / 1000, 2)} L`;
  waterMaxLiters.textContent = `${formatNumberBR(data.maxMl / 1000, 2)} L`;

  bottlesValue.textContent = formatNumberBR(data.bottles500, 0);
  bucketsValue.textContent = formatNumberBR(data.buckets10L, 2);
  cupsValue.textContent = formatNumberBR(data.cups250, 0);
  poolsValue.textContent = formatNumberBR(data.pools, 6);
}

function tick() {
  if (!running) return;
  const now = performance.now();
  const elapsed = elapsedBeforePause + (now - startTime);
  updateLiveData(elapsed);
  rafId = requestAnimationFrame(tick);
}

startBtn.addEventListener("click", () => {
  if (running) return;
  running = true;
  startTime = performance.now();
  tick();
});

pauseBtn.addEventListener("click", () => {
  if (!running) return;
  running = false;
  elapsedBeforePause += performance.now() - startTime;
  cancelAnimationFrame(rafId);
});

resetBtn.addEventListener("click", () => {
  running = false;
  startTime = 0;
  elapsedBeforePause = 0;
  cancelAnimationFrame(rafId);
  updateLiveData(0);
});

fullscreenBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await document.documentElement.requestFullscreen();
  } else {
    await document.exitFullscreen();
  }
});

// SIMULAÇÃO
function getSecondsFromSimulationInput(value, unit) {
  if (unit === "minutes") return value * 60;
  if (unit === "hours") return value * 3600;
  if (unit === "days") return value * 86400;
  return value * 60;
}

function formatSimulationLabel(value, unit) {
  const labels = {
    minutes: value === 1 ? "minuto" : "minutos",
    hours: value === 1 ? "hora" : "horas",
    days: value === 1 ? "dia" : "dias"
  };

  return `${formatNumberBR(value)} ${labels[unit]}`;
}

function runSimulation() {
  const value = Number(simInput.value) || 0;
  const unit = simUnit.value;
  const rate = Number(simRate.value) || 35;

  const seconds = getSecondsFromSimulationInput(value, unit);
  const data = calculateImpact(seconds, rate);

  simTimeResult.textContent = formatSimulationLabel(value, unit);
  simInteractions.textContent = formatNumberBR(data.interactions, 0);
  simWaterMin.textContent = `${formatNumberBR(data.minMl / 1000, 2)} L`;
  simWaterMax.textContent = `${formatNumberBR(data.maxMl / 1000, 2)} L`;
  simBottles.textContent = formatNumberBR(data.bottles500, 0);
}

calcBtn.addEventListener("click", runSimulation);
simInput.addEventListener("input", runSimulation);
simUnit.addEventListener("change", runSimulation);
simRate.addEventListener("change", runSimulation);

// ABAS
const tabButtons = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    tabButtons.forEach((b) => b.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(target).classList.add("active");
  });
});

// FUNDO COM BOLHAS
const waterBg = document.getElementById("waterBg");

function createBubble() {
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.style.left = Math.random() * 100 + "vw";

  const size = 8 + Math.random() * 26;
  bubble.style.width = size + "px";
  bubble.style.height = size + "px";
  bubble.style.animationDuration = (8 + Math.random() * 10) + "s";
  bubble.style.animationDelay = Math.random() * 2 + "s";

  waterBg.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, 20000);
}

setInterval(createBubble, 700);

// GRÁFICO EM CANVAS
const canvas = document.getElementById("impactChart");
const ctx = canvas.getContext("2d");

const chartData = [
  { label: "GPT-3 (treinamento)", value: 700000, color: "#0ea5e9" },
  { label: "Microsoft (+6,4 mi L)", value: 6400000, color: "#38bdf8" },
  { label: "IA em 1 dia (mín.)", value: 10000000, color: "#22c55e" },
  { label: "IA em 1 dia (máx.)", value: 25000000, color: "#0369a1" }
];

function drawRoundedRect(x, y, w, h, r, fillStyle) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fillStyle;
  ctx.fill();
}

function drawChart() {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width * dpr;
  canvas.height = 480 * dpr;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = 480;
  const padding = { top: 30, right: 30, bottom: 85, left: 72 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = Math.max(...chartData.map(item => item.value));

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(23,50,77,.10)";
  ctx.lineWidth = 1;

  for (let i = 0; i <= 5; i++) {
    const y = padding.top + (chartH / 5) * i;

    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    const val = maxVal - (maxVal / 5) * i;
    ctx.fillStyle = "#6c8294";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.fillText(formatCompactLiters(val), padding.left - 10, y + 4);
  }

  const barCount = chartData.length;
  const barWidth = Math.min(120, chartW / (barCount * 1.8));
  const gap = (chartW - barWidth * barCount) / (barCount + 1);

  chartData.forEach((item, index) => {
    const x = padding.left + gap + index * (barWidth + gap);
    const barHeight = (item.value / maxVal) * chartH;
    const y = padding.top + chartH - barHeight;

    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
    gradient.addColorStop(0, item.color);
    gradient.addColorStop(1, shadeColor(item.color, -18));

    drawRoundedRect(x, y, barWidth, barHeight, 18, gradient);

    ctx.fillStyle = "#163b55";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText(formatCompactLiters(item.value), x + barWidth / 2, y - 10);

    wrapText(item.label, x + barWidth / 2, padding.top + chartH + 26, barWidth + 26, 16);
  });

  ctx.save();
  ctx.translate(18, height / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "#4a6377";
  ctx.font = "bold 14px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Litros de água", 0, 0);
  ctx.restore();
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  ctx.fillStyle = "#4f6677";
  ctx.font = "bold 13px Arial";
  ctx.textAlign = "center";

  const words = text.split(" ");
  let line = "";
  const lines = [];

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }

  lines.push(line.trim());

  lines.forEach((currentLine, index) => {
    ctx.fillText(currentLine, x, y + index * lineHeight);
  });
}

function formatCompactLiters(value) {
  if (value >= 1000000) {
    return (value / 1000000).toLocaleString("pt-BR", {
      maximumFractionDigits: 1
    }) + " mi L";
  }

  if (value >= 1000) {
    return (value / 1000).toLocaleString("pt-BR", {
      maximumFractionDigits: 0
    }) + " mil L";
  }

  return value.toLocaleString("pt-BR") + " L";
}

function shadeColor(hex, percent) {
  let f = parseInt(hex.slice(1), 16),
    t = percent < 0 ? 0 : 255,
    p = Math.abs(percent) / 100,
    R = f >> 16,
    G = (f >> 8) & 0x00FF,
    B = f & 0x0000FF;

  return "#" + (
    0x1000000 +
    (Math.round((t - R) * p) + R) * 0x10000 +
    (Math.round((t - G) * p) + G) * 0x100 +
    (Math.round((t - B) * p) + B)
  ).toString(16).slice(1);
}

window.addEventListener("resize", drawChart);

// INICIALIZAÇÃO
updateLiveData(0);
runSimulation();
drawChart();
