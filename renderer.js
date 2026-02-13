const timeDisplay = document.getElementById('timeDisplay');
const timerApp = document.getElementById('timerApp');
const notice = document.getElementById('notice');
const minutesInput = document.getElementById('minutesInput');
const applyDurationBtn = document.getElementById('applyDurationBtn');
const clickThroughBtn = document.getElementById('clickThroughBtn');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');

let configuredDuration = 20 * 60;
let remainingSeconds = configuredDuration;
let intervalId = null;
let clickThroughEnabled = false;

function format(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function render() {
  timeDisplay.textContent = format(remainingSeconds);
}

function renderClickThroughState() {
  clickThroughBtn.textContent = `Pass Through: ${clickThroughEnabled ? 'ON' : 'OFF'}`;
}

function clearTimeUpStyle() {
  timerApp.classList.remove('flash', 'time-up-mode');
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

function onTimeUp() {
  stopTimer();
  notice.textContent = 'TIME UP';
  timerApp.classList.add('flash', 'time-up-mode');
}

function tick() {
  if (remainingSeconds <= 0) {
    onTimeUp();
    return;
  }

  remainingSeconds -= 1;
  render();

  if (remainingSeconds <= 0) {
    onTimeUp();
  }
}

startBtn.addEventListener('click', () => {
  if (remainingSeconds <= 0) {
    return;
  }

  if (!intervalId) {
    notice.textContent = '';
    clearTimeUpStyle();
    intervalId = setInterval(tick, 1000);
  }
});

pauseBtn.addEventListener('click', () => {
  stopTimer();
});

resetBtn.addEventListener('click', () => {
  stopTimer();
  remainingSeconds = configuredDuration;
  notice.textContent = '';
  clearTimeUpStyle();
  render();
});

applyDurationBtn.addEventListener('click', async () => {
  const min = Number(minutesInput.value);

  if (!Number.isFinite(min) || min <= 0) {
    notice.textContent = 'Please input minute >= 1';
    return;
  }

  configuredDuration = Math.floor(min * 60);
  await window.desktopTimerApi.setDuration(configuredDuration);
  remainingSeconds = configuredDuration;
  stopTimer();
  clearTimeUpStyle();
  notice.textContent = 'Saved';
  render();
});

clickThroughBtn.addEventListener('click', async () => {
  clickThroughEnabled = !clickThroughEnabled;
  await window.desktopTimerApi.setClickThrough(clickThroughEnabled);
  renderClickThroughState();

  if (clickThroughEnabled) {
    notice.textContent = 'Disable: Ctrl/Cmd + Shift + X';
  } else {
    notice.textContent = '';
  }
});

window.desktopTimerApi.onClickThroughChanged((value) => {
  clickThroughEnabled = value;
  renderClickThroughState();
  notice.textContent = value ? 'Disable: Ctrl/Cmd + Shift + X' : '';
});

async function boot() {
  const settings = await window.desktopTimerApi.getSettings();
  configuredDuration = settings.durationSeconds || configuredDuration;
  remainingSeconds = configuredDuration;
  minutesInput.value = Math.floor(configuredDuration / 60);
  render();
  renderClickThroughState();
}

boot();
