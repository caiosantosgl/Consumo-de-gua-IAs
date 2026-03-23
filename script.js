const ML_PER_INTERACTION_MIN = 10;
const ML_PER_INTERACTION_MAX = 25;
const OLIMPIC_POOL_LITERS = 2500000;

let LIVE_INTERACTIONS_PER_SECOND = 35;

const body = document.body;
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
const liveRateLabel = document.getElementById("liveRateLabel");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const fullscreenBtn = document.getElementById("fullscreenBtn");

const simInput = document.getElementById("simInput");
const simUnit = document.getElementById("simUnit");
const simRate = document.getElementById("simRate");
const calcBtn = document.getElementById("calcBtn");
const simTimeResult = document.getElementById("simTimeResult");
const simRateResult = document.getElementById("simRateResult");
const simInteractions = document.getElementById("simInteractions");
const simWaterMin = document.getElementById("simWaterMin");
const simWaterMax = document.getElementById("simWaterMax");
const simBottles = document.getElementById("simBottles");

let running = false;
let startTime = 0;
let elapsedBeforePause = 0;
let rafId = null;
let presentationMode = false;

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

  if (liters < 1) {
    return `${formatNumberBR(Math.round(ml), 0)} ml`;
  }

  return `${formatNumberBR(liters, 2)} L`;
}

function calculateImpact(seconds, interactionsPerSecond = LIVE_INTERACTIONS_PER_SECOND) {
  const interactions = seconds * interactionsPerSecond;
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
  const data = calculateImpact(seconds, LIVE_INTERACTIONS_PER_SECOND);

  timeDisplay.textContent = formatTime(ms);
  elapsedSeconds.textContent = `${formatNumberBR(seconds)}s`;
  interactionsValue.textContent = formatNumberBR(Math.round(data.interactions), 0);

  waterMinMl.textContent = formatLitersFromMl(data.minMl);
  waterMaxMl.textContent = formatLitersFromMl(data.maxMl);

  waterMinLiters.textContent = `${formatNumberBR(data.minMl / 1000, 2)} L`;
  waterMaxLiters.textContent = `${formatNumberBR(data.maxMl / 1000, 2)} L`;

  bottlesValue.textContent = formatNumberBR(Math.round(data.bottles500), 0);
  bucketsValue.textContent = formatNumberBR(Math.round(data.buckets10L), 0);
  cupsValue.textContent = formatNumberBR(Math.round(data.cups250), 0);
  poolsValue.textContent = formatNumberBR(Math.round(data.pools), 0);

  liveRateLabel.textContent = `simulação: ${formatNumberBR(LIVE_INTERACTIONS_PER_SECOND)} interações/seg`;
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

function enterPresentationMode() {
  presentationMode = true;
  body.classList.add("presentation-mode");
  fullscreenBtn.textContent = "⛶ Sair da Tela Cheia";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function exitPresentationMode() {
  presentationMode = false;
  body.classList.remove("presentation-mode");
  fullscreenBtn.textContent = "⛶ Tela Cheia";
}

fullscreenBtn.addEventListener("click", () => {
  if (!presentationMode) {
    enterPresentationMode();
  } else {
    exitPresentationMode();
  }
});

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

  LIVE_INTERACTIONS_PER_SECOND = rate;

  simTimeResult.textContent = formatSimulationLabel(value, unit);
  simRateResult.textContent = `${formatNumberBR(rate)} interações/seg`;
  simInteractions.textContent = formatNumberBR(Math.round(data.interactions), 0);
  simWaterMin.textContent = `${formatNumberBR(data.minMl / 1000, 2)} L`;
  simWaterMax.textContent = `${formatNumberBR(data.maxMl / 1000, 2)} L`;
  simBottles.textContent = formatNumberBR(Math.round(data.bottles500), 0);

  const currentElapsed = running
    ? elapsedBeforePause + (performance.now() - startTime)
    : elapsedBeforePause;

  updateLiveData(currentElapsed);
}

calcBtn.addEventListener("click", runSimulation);
simInput.addEventListener("input", runSimulation);
simUnit.addEventListener("change", runSimulation);
simRate.addEventListener("change", runSimulation);

const tabButtons = document.querySelectorAll(".tab-btn");
const panels = document.querySelectorAll(".tab-panel");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    tabButtons.forEach((b) => b.classList.remove("active"));
    panels.forEach((p) => p.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById(target).classList.add("active");

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

const waterBg = document.getElementById("waterBg");

function createBubble() {
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.style.left = `${Math.random() * 100}vw`;

  const size = 8 + Math.random() * 20;
  bubble.style.width = `${size}px`;
  bubble.style.height = `${size}px`;
  bubble.style.animationDuration = `${8 + Math.random() * 10}s`;
  bubble.style.animationDelay = `${Math.random() * 2}s`;

  waterBg.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, 20000);
}

setInterval(createBubble, 850);

updateLiveData(0);
runSimulation();