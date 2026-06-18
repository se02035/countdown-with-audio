const DEFAULT_DURATION = "1m30s";

const State = {
  IDLE: "idle",
  RUNNING: "running",
  PAUSED: "paused",
  PLAYING: "playing",
};

const displayEl = document.getElementById("display");
const statusEl = document.getElementById("status");
const screenEl = document.querySelector(".stage");
const durationInput = document.getElementById("duration");
const audioCutoffInput = document.getElementById("audioCutoff");
const trackSelect = document.getElementById("track");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const resetBtn = document.getElementById("resetBtn");
const player = document.getElementById("player");

let manifest = null;
let animationFrameId = null;
let audioStopTimeoutId = null;
let countdownEndAt = 0;
let pausedRemainingMs = 0;
let totalMs = 0;
let state = State.IDLE;

function parseDuration(value) {
  const input = String(value).trim().toLowerCase();
  if (!input) {
    throw new Error("duration required");
  }

  const pattern = /(\d+)\s*([hms])/g;
  let match;
  let totalSeconds = 0;
  let consumed = "";

  while ((match = pattern.exec(input)) !== null) {
    const amount = Number(match[1]);
    const unit = match[2];

    if (unit === "h") {
      totalSeconds += amount * 3600;
    } else if (unit === "m") {
      totalSeconds += amount * 60;
    } else {
      totalSeconds += amount;
    }

    consumed += match[0];
  }

  if (consumed.replace(/\s+/g, "") !== input.replace(/\s+/g, "")) {
    throw new Error(`invalid duration: ${value}`);
  }

  if (totalSeconds <= 0) {
    throw new Error("duration must be > 0");
  }

  return totalSeconds * 1000;
}

function formatTime(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function buildTrackUrl(audioPath, filename) {
  const encodedPath = audioPath
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `${encodedPath}/${encodeURIComponent(filename)}`;
}

function pickTrack(trackValue) {
  if (!manifest?.tracks?.length) {
    throw new Error("no tracks available");
  }

  if (trackValue === "random") {
    const index = Math.floor(Math.random() * manifest.tracks.length);
    return manifest.tracks[index];
  }

  if (!manifest.tracks.includes(trackValue)) {
    throw new Error(`unknown track: ${trackValue}`);
  }

  return trackValue;
}

function setDisplay(text) {
  displayEl.textContent = text;
  displayEl.dataset.text = text;
}

function setStatus(message, screenState = "") {
  statusEl.textContent = message;
  screenEl.classList.remove("is-running", "is-paused", "is-finished", "is-error");

  if (screenState) {
    screenEl.classList.add(screenState);
  }
}

function updateControls() {
  const inputsLocked = state === State.RUNNING || state === State.PAUSED;

  durationInput.disabled = inputsLocked;
  audioCutoffInput.disabled = inputsLocked;
  trackSelect.disabled = inputsLocked;

  startBtn.disabled = state === State.RUNNING || state === State.PAUSED;
  pauseBtn.disabled = state !== State.RUNNING && state !== State.PAUSED;
  pauseBtn.textContent = state === State.PAUSED ? "RESUME" : "PAUSE";
  resetBtn.disabled = state === State.IDLE;
}

function setState(nextState) {
  state = nextState;
  updateControls();
}

function clearAudioStopTimeout() {
  if (audioStopTimeoutId !== null) {
    window.clearTimeout(audioStopTimeoutId);
    audioStopTimeoutId = null;
  }
}

function stopAudio() {
  clearAudioStopTimeout();
  player.pause();
  player.currentTime = 0;
  player.removeAttribute("src");
  player.load();
}

function cancelCountdownLoop() {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function resetDisplay() {
  try {
    totalMs = parseDuration(durationInput.value);
    setDisplay(formatTime(totalMs));
    setStatus("READY");
  } catch {
    setDisplay("--:--");
    setStatus("INVALID", "is-error");
  }
}

function resetAll() {
  cancelCountdownLoop();
  stopAudio();
  setState(State.IDLE);
  resetDisplay();
}

function getRemainingMs() {
  return Math.max(0, countdownEndAt - performance.now());
}

function updateCountdownFrame() {
  const remainingMs = getRemainingMs();
  setDisplay(formatTime(remainingMs));

  if (remainingMs > 0) {
    animationFrameId = requestAnimationFrame(updateCountdownFrame);
    return;
  }

  animationFrameId = null;
  onCountdownComplete();
}

async function playSelectedTrack(audioCutoff) {
  const trackName = pickTrack(trackSelect.value);
  const trackUrl = buildTrackUrl(manifest.audioPath, trackName);

  stopAudio();
  player.src = trackUrl;
  player.load();

  setState(State.PLAYING);
  setStatus("PLAYING", "is-finished");

  try {
    await player.play();
  } catch (error) {
    throw new Error(`audio error: ${error.message}`);
  }

  if (audioCutoff > 0) {
    audioStopTimeoutId = window.setTimeout(() => {
      player.pause();
      audioStopTimeoutId = null;
      setStatus("PLAYING", "is-finished");
    }, audioCutoff * 1000);
  }
}

async function onCountdownComplete() {
  setDisplay("00:00");

  try {
    const audioCutoff = Number(audioCutoffInput.value);
    await playSelectedTrack(audioCutoff);
  } catch (error) {
    setState(State.IDLE);
    setStatus("ERROR", "is-error");
  }
}

function startCountdown() {
  if (state === State.PLAYING) {
    stopAudio();
  }

  cancelCountdownLoop();

  let durationMs;
  const audioCutoff = Number(audioCutoffInput.value);

  try {
    durationMs = parseDuration(durationInput.value);
    totalMs = durationMs;

    if (Number.isNaN(audioCutoff)) {
      throw new Error("audio cutoff must be a number");
    }
  } catch (error) {
    setStatus("ERROR", "is-error");
    return;
  }

  countdownEndAt = performance.now() + durationMs;
  setState(State.RUNNING);
  setStatus("", "is-running");
  updateCountdownFrame();
}

function pauseCountdown() {
  if (state === State.RUNNING) {
    cancelCountdownLoop();
    pausedRemainingMs = getRemainingMs();
    setDisplay(formatTime(pausedRemainingMs));
    setState(State.PAUSED);
    setStatus("PAUSED", "is-paused");
    return;
  }

  if (state === State.PAUSED) {
    countdownEndAt = performance.now() + pausedRemainingMs;
    setState(State.RUNNING);
    setStatus("", "is-running");
    updateCountdownFrame();
  }
}

function isTypingTarget(target) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  );
}

function handleSpaceKey(event) {
  if (event.code !== "Space" && event.key !== " ") {
    return;
  }

  if (isTypingTarget(event.target)) {
    return;
  }

  if (state !== State.RUNNING && state !== State.PAUSED) {
    return;
  }

  event.preventDefault();
  pauseCountdown();
}

function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);

  if (params.has("d")) {
    durationInput.value = params.get("d");
  }

  if (params.has("a")) {
    audioCutoffInput.value = params.get("a");
  }

  if (params.has("track")) {
    trackSelect.value = params.get("track");
  }
}

function populateTrackOptions(tracks) {
  for (const track of tracks) {
    const option = document.createElement("option");
    option.value = track;
    option.textContent = track;
    trackSelect.appendChild(option);
  }
}

async function loadManifest() {
  const response = await fetch("manifest.json");

  if (!response.ok) {
    throw new Error("failed to load manifest");
  }

  manifest = await response.json();

  if (!manifest.audioPath || !Array.isArray(manifest.tracks) || manifest.tracks.length === 0) {
    throw new Error("invalid manifest");
  }

  populateTrackOptions(manifest.tracks);
}

async function init() {
  try {
    await loadManifest();
    applyUrlParams();
    totalMs = parseDuration(durationInput.value || DEFAULT_DURATION);
    setDisplay(formatTime(totalMs));
    setState(State.IDLE);
    setStatus("READY");
  } catch (error) {
    setDisplay("--:--");
    setState(State.IDLE);
    setStatus("ERROR", "is-error");
    startBtn.disabled = true;
  }
}

startBtn.addEventListener("click", startCountdown);
pauseBtn.addEventListener("click", pauseCountdown);
resetBtn.addEventListener("click", resetAll);
document.addEventListener("keydown", handleSpaceKey);

durationInput.addEventListener("change", () => {
  if (state !== State.IDLE) {
    return;
  }

  try {
    totalMs = parseDuration(durationInput.value);
    setDisplay(formatTime(totalMs));
    setStatus("READY");
  } catch (error) {
    setStatus("INVALID", "is-error");
  }
});

init();
