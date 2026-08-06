import { MELBOURNE, OFFICES, getZonedParts, localMessage, rotationPair } from './core.js';

const STAGE_WIDTH = 3840;
const STAGE_HEIGHT = 804;
const PANEL_TEXT_WIDTH = 1120;
const MAX_MESSAGE_SIZE = 132;
const MIN_MESSAGE_SIZE = 58;

const params = new URLSearchParams(window.location.search);
const demoMode = params.get('demo') === '1';
const debugMode = params.get('debug') === '1';
const noAnimation = params.get('noanim') === '1';
const demoInterval = clamp(Number(params.get('interval')) || 6000, 2200, 30000);
const freezeDate = parseFreeze(params.get('freeze'));
const pinnedLeft = officeById(params.get('left'));
const pinnedRight = officeById(params.get('right'));
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const stage = document.querySelector('#stage');
const rotatePrompt = document.querySelector('#rotatePrompt');
const panelElements = {
  left: makePanel('left'),
  centre: makePanel('centre'),
  right: makePanel('right')
};

const state = {
  left: { office: null, lines: ['', ''], minuteKey: '', token: 0 },
  centre: { office: MELBOURNE, lines: ['', ''], minuteKey: '', token: 0 },
  right: { office: null, lines: ['', ''], minuteKey: '', token: 0 }
};

let demoStart = performance.now();
let lastSecondKey = '';

if (debugMode) document.body.classList.add('debug');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function parseFreeze(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function officeById(id) {
  return id ? OFFICES.find((office) => office.id === id) ?? null : null;
}

function makePanel(name) {
  const panel = document.querySelector(`#${name}Panel`);
  const title = document.querySelector(`#${name}Title`);
  const message = document.querySelector(`#${name}Message`);
  const lines = [...message.querySelectorAll('.message-line')].map((line) => ({
    root: line,
    typed: line.querySelector('.typed'),
    cursor: line.querySelector('.cursor')
  }));
  return { panel, title, message, lines };
}

function getNow(nowPerformance = performance.now()) {
  if (freezeDate) return new Date(freezeDate.getTime());
  if (!demoMode) return new Date();
  const elapsedMinutes = Math.floor((nowPerformance - demoStart) / demoInterval);
  return new Date(Date.now() + elapsedMinutes * 60000);
}

function currentEpochMinute(nowPerformance = performance.now()) {
  if (demoMode) return Math.floor((nowPerformance - demoStart) / demoInterval);
  return Math.floor(getNow(nowPerformance).getTime() / 60000);
}

function selectedOffices(nowPerformance) {
  const [rotatingLeft, rotatingRight] = rotationPair(currentEpochMinute(nowPerformance));
  const left = pinnedLeft ?? rotatingLeft;
  let right = pinnedRight ?? rotatingRight;
  if (right.id === left.id) right = OFFICES[(OFFICES.indexOf(right) + 1) % OFFICES.length];
  return [left, right];
}

function titleMarkup(office, parts) {
  return `<span class="city">${escapeHtml(office.city)}</span><span class="clock">${parts.digital}</span><span class="date">${escapeHtml(parts.dateText)}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function minuteKey(office, parts) {
  return `${office.id}-${parts.year}-${parts.month}-${parts.day}-${parts.hour}-${parts.minute}`;
}

function measurePanelFontSize(panelName, lines, language) {
  const panel = panelElements[panelName];
  const probe = panel.lines[0].root.cloneNode(true);
  const typed = probe.querySelector('.typed');
  probe.querySelector('.cursor').remove();
  probe.style.position = 'absolute';
  probe.style.left = '-10000px';
  probe.style.top = '0';
  probe.style.width = 'max-content';
  probe.style.maxWidth = 'none';
  probe.style.overflow = 'visible';
  probe.style.visibility = 'hidden';
  probe.lang = language;
  document.body.append(probe);

  const widthAt = (size) => {
    probe.style.fontSize = `${size}px`;
    let widest = 0;
    for (const text of lines) {
      typed.textContent = text || ' ';
      widest = Math.max(widest, probe.scrollWidth);
    }
    return widest;
  };

  let low = MIN_MESSAGE_SIZE;
  let high = MAX_MESSAGE_SIZE;
  for (let pass = 0; pass < 15; pass += 1) {
    const middle = (low + high) / 2;
    if (widthAt(middle) <= PANEL_TEXT_WIDTH - 10) low = middle;
    else high = middle;
  }
  probe.remove();
  return Math.floor(low * 100) / 100;
}

function applyPanelSize(panelName, lines, language) {
  const size = measurePanelFontSize(panelName, lines, language);
  panelElements[panelName].message.style.setProperty('--message-size', `${size}px`);
  panelElements[panelName].message.dataset.fontSize = String(size);
}

function setCursor(line, working, visible = true) {
  line.cursor.hidden = !visible;
  line.cursor.classList.toggle('blink', visible && !working);
}

function sleep(ms, token, panelState) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      if (token !== panelState.token) reject(new DOMException('Superseded', 'AbortError'));
      else resolve();
    }, ms);
  });
}

async function typeLine(panelName, lineIndex, target, token, panelState) {
  const line = panelElements[panelName].lines[lineIndex];
  setCursor(line, true);
  line.typed.textContent = '';
  if (noAnimation || reducedMotion) {
    line.typed.textContent = target;
    setCursor(line, false);
    return;
  }
  let text = '';
  for (const character of target) {
    text += character;
    line.typed.textContent = text;
    await sleep(26, token, panelState);
  }
  setCursor(line, false);
}

async function deleteLine(panelName, lineIndex, token, panelState) {
  const line = panelElements[panelName].lines[lineIndex];
  setCursor(line, true);
  if (noAnimation || reducedMotion) {
    line.typed.textContent = '';
    setCursor(line, false, false);
    return;
  }
  let text = line.typed.textContent;
  while (text.length > 0) {
    text = text.slice(0, -1);
    line.typed.textContent = text;
    await sleep(16, token, panelState);
  }
  setCursor(line, false, false);
}

async function transitionPanel(panelName, office, lines, key) {
  const panelState = state[panelName];
  const panel = panelElements[panelName];
  const token = ++panelState.token;
  panel.message.lang = office.language;

  try {
    if (panelState.lines.some(Boolean)) {
      await deleteLine(panelName, 1, token, panelState);
      await deleteLine(panelName, 0, token, panelState);
    }
    applyPanelSize(panelName, lines, office.language);
    panelState.office = office;
    panelState.lines = [...lines];
    panelState.minuteKey = key;
    await typeLine(panelName, 0, lines[0], token, panelState);
    await typeLine(panelName, 1, lines[1], token, panelState);
    setCursor(panel.lines[1], false);
  } catch (error) {
    if (error?.name !== 'AbortError') throw error;
  }
}

function updateTitles(now) {
  for (const panelName of ['left', 'centre', 'right']) {
    const office = state[panelName].office;
    if (!office) continue;
    const parts = getZonedParts(now, office);
    panelElements[panelName].title.innerHTML = titleMarkup(office, parts);
  }
}

function updateMinute(now, nowPerformance) {
  const [leftOffice, rightOffice] = selectedOffices(nowPerformance);
  const centreParts = getZonedParts(now, MELBOURNE);
  const leftParts = getZonedParts(now, leftOffice);
  const rightParts = getZonedParts(now, rightOffice);
  const leadIndex = currentEpochMinute(nowPerformance);

  const centreLines = localMessage(MELBOURNE, centreParts.hour, centreParts.minute, leadIndex);
  const leftLines = localMessage(leftOffice, leftParts.hour, leftParts.minute, leadIndex);
  const rightLines = localMessage(rightOffice, rightParts.hour, rightParts.minute, leadIndex + 1);

  state.left.office = leftOffice;
  state.centre.office = MELBOURNE;
  state.right.office = rightOffice;

  const leftKey = minuteKey(leftOffice, leftParts);
  const centreKey = minuteKey(MELBOURNE, centreParts);
  const rightKey = minuteKey(rightOffice, rightParts);

  if (state.left.minuteKey !== leftKey) transitionPanel('left', leftOffice, leftLines, leftKey);
  if (state.centre.minuteKey !== centreKey) transitionPanel('centre', MELBOURNE, centreLines, centreKey);
  if (state.right.minuteKey !== rightKey) transitionPanel('right', rightOffice, rightLines, rightKey);
}

function scaleStage() {
  const viewport = window.visualViewport;
  const width = viewport?.width ?? window.innerWidth;
  const height = viewport?.height ?? window.innerHeight;
  const scale = Math.min(width / STAGE_WIDTH, height / STAGE_HEIGHT);
  stage.style.transform = `translate(-50%, -50%) scale(${scale})`;
  rotatePrompt.hidden = !(width < height && width < 900);
}

function tick(nowPerformance = performance.now()) {
  const now = getNow(nowPerformance);
  const secondKey = `${now.getUTCFullYear()}-${now.getUTCMonth()}-${now.getUTCDate()}-${now.getUTCHours()}-${now.getUTCMinutes()}-${now.getUTCSeconds()}-${currentEpochMinute(nowPerformance)}`;
  if (secondKey !== lastSecondKey) {
    lastSecondKey = secondKey;
    updateMinute(now, nowPerformance);
    updateTitles(now);
  }
  window.requestAnimationFrame(tick);
}

window.addEventListener('resize', scaleStage, { passive: true });
window.addEventListener('orientationchange', scaleStage, { passive: true });
window.visualViewport?.addEventListener('resize', scaleStage, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    lastSecondKey = '';
    scaleStage();
  }
});

await Promise.allSettled([
  document.fonts.load('700 126px "PT Serif Local"'),
  document.fonts.load('600 28px "Open Sans Local"')
]);
await document.fonts.ready;
scaleStage();
window.requestAnimationFrame(tick);

window.__clock = Object.freeze({
  get panels() {
    return Object.fromEntries(Object.entries(state).map(([name, value]) => [name, {
      office: value.office?.id ?? null,
      lines: [...value.lines],
      minuteKey: value.minuteKey,
      fontSize: Number(panelElements[name].message.dataset.fontSize || 0)
    }]));
  },
  get scale() {
    const match = /scale\(([^)]+)\)/.exec(stage.style.transform);
    return match ? Number(match[1]) : 1;
  },
  offices: OFFICES.map((office) => office.id),
  localMessage,
  getZonedParts,
  rotationPair
});
