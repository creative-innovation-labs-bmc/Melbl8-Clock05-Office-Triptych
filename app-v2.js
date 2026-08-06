import { MELBOURNE, OFFICES, getZonedParts, localMessage } from './core.js';

const STAGE_WIDTH = 3840;
const STAGE_HEIGHT = 804;
const PANEL_TEXT_WIDTH = 1120;
const MAX_MESSAGE_SIZE = 132;
const MIN_MESSAGE_SIZE = 58;
const SIDE_CYCLE_MS = 30000;
const RIGHT_OFFSET_MS = 15000;
const CENTRE_CYCLE_MS = 60000;

const params = new URLSearchParams(window.location.search);
const demoMode = params.get('demo') === '1';
const noAnimation = params.get('noanim') === '1';
const debugMode = params.get('debug') === '1';
const freezeDate = parseFreeze(params.get('freeze'));
const demoInterval = Math.max(2200, Number(params.get('interval')) || 5000);
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const COUNTRY = Object.freeze({
  melbourne: 'Australia',
  'hong-kong': 'Hong Kong',
  shanghai: 'China',
  beijing: 'China',
  jakarta: 'Indonesia',
  manila: 'Philippines',
  singapore: 'Singapore',
  bangkok: 'Thailand',
  'ho-chi-minh-city': 'Vietnam',
  'kuala-lumpur': 'Malaysia',
  macau: 'Macau',
  auckland: 'New Zealand',
  wellington: 'New Zealand',
  sydney: 'Australia',
  brisbane: 'Australia'
});

const SIDE_INTROS = Object.freeze({
  'hong-kong': ['致香港的同事，', '向香港的朋友問好，', '香港的同事現在是'],
  shanghai: ['给上海的同事，', '向上海的朋友问好，', '上海的同事现在是'],
  beijing: ['给北京的同事，', '向北京的朋友问好，', '北京的同事现在是'],
  jakarta: ['Untuk rekan kami di Jakarta,', 'Salam untuk teman-teman di Jakarta,', 'Bagi kolega kami di Jakarta,'],
  manila: ['Para sa mga kaibigan natin sa Maynila,', 'Para sa ating mga kasamahan sa Maynila,', 'Sa mga kaibigan natin sa Maynila,'],
  singapore: ['For our colleagues in Singapore,', 'For our friends in Singapore,', 'Over in Singapore, it is'],
  bangkok: ['สำหรับเพื่อนร่วมงานที่กรุงเทพฯ', 'ถึงเพื่อน ๆ ที่กรุงเทพฯ', 'สำหรับทีมงานที่กรุงเทพฯ'],
  'ho-chi-minh-city': ['Dành cho các bạn ở Thành phố Hồ Chí Minh,', 'Gửi đến đồng nghiệp ở Thành phố Hồ Chí Minh,', 'Với bạn bè ở Thành phố Hồ Chí Minh,'],
  'kuala-lumpur': ['Untuk rakan-rakan kami di Kuala Lumpur,', 'Buat sahabat kami di Kuala Lumpur,', 'Untuk pasukan di Kuala Lumpur,'],
  macau: ['致澳門的同事，', '向澳門的朋友問好，', '澳門的同事現在是'],
  auckland: ['For our friends in Auckland,', 'For our colleagues in Auckland,', 'Over in Auckland, it is'],
  wellington: ['For our friends in Wellington,', 'For our colleagues in Wellington,', 'Over in Wellington, it is'],
  sydney: ['For our friends in Sydney,', 'For our colleagues in Sydney,', 'Over in Sydney, it is'],
  brisbane: ['For our friends in Brisbane,', 'For our colleagues in Brisbane,', 'Over in Brisbane, it is']
});

const stage = document.querySelector('#stage');
const rotatePrompt = document.querySelector('#rotatePrompt');
const officePool = [...OFFICES];
const panels = {
  left: makePanel('left', SIDE_CYCLE_MS, 0),
  centre: makePanel('centre', CENTRE_CYCLE_MS, 0),
  right: makePanel('right', SIDE_CYCLE_MS, RIGHT_OFFSET_MS)
};

let demoStart = performance.now();
let lastSecond = '';

if (debugMode) document.body.classList.add('debug');

function parseFreeze(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function makePanel(name, cycleMs, offsetMs) {
  const message = document.querySelector(`#${name}Message`);
  return {
    name,
    cycleMs,
    offsetMs,
    title: document.querySelector(`#${name}Title`),
    progress: document.querySelector(`#${name}Progress`),
    message,
    lines: [...message.querySelectorAll('.message-line')].map((root) => ({
      root,
      typed: root.querySelector('.typed'),
      cursor: root.querySelector('.cursor')
    })),
    rendered: ['', ''],
    office: name === 'centre' ? MELBOURNE : null,
    cadenceKey: '',
    token: 0
  };
}

function getNow(nowPerformance = performance.now()) {
  if (freezeDate) return new Date(freezeDate.getTime());
  if (!demoMode) return new Date();
  const acceleratedMs = (nowPerformance - demoStart) * (SIDE_CYCLE_MS / demoInterval);
  return new Date(Date.now() + acceleratedMs);
}

function EnglishTitle(office, parts) {
  const country = COUNTRY[office.id] || '';
  const city = office.cityEnglish || office.city;
  return `<span class="city">${escapeHtml(city)}, ${escapeHtml(country)}</span><span class="clock">${parts.digital}</span><span class="date">${escapeHtml(parts.dateText)}</span>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sideSlot(panel, now) {
  return Math.floor((now.getTime() - panel.offsetMs) / panel.cycleMs);
}

function officeFor(panel, now) {
  if (panel.name === 'centre') return MELBOURNE;
  const slot = sideSlot(panel, now);
  const index = ((slot % officePool.length) + officePool.length) % officePool.length;
  if (panel.name === 'left') return officePool[index];
  let rightIndex = (index + Math.ceil(officePool.length / 2)) % officePool.length;
  const left = officeFor(panels.left, now);
  if (officePool[rightIndex].id === left.id) rightIndex = (rightIndex + 1) % officePool.length;
  return officePool[rightIndex];
}

function messageFor(panel, office, parts, now) {
  const local = localMessage(office, parts.hour, parts.minute, Math.floor(now.getTime() / 60000));
  if (panel.name === 'centre') {
    const leads = ['In Melbourne, it is', 'Here in Melbourne, it is', 'For Melbourne, the time is'];
    return [leads[parts.minute % leads.length], local[1]];
  }
  const intros = SIDE_INTROS[office.id] || [`For our friends in ${office.cityEnglish || office.city},`];
  const slot = sideSlot(panel, now);
  const index = ((slot + (panel.name === 'right' ? 1 : 0)) % intros.length + intros.length) % intros.length;
  return [intros[index], local[1]];
}

function cadenceKey(panel, office, parts, now) {
  if (panel.name === 'centre') return `${office.id}-${parts.year}-${parts.month}-${parts.day}-${parts.hour}-${parts.minute}`;
  return `${office.id}-${sideSlot(panel, now)}`;
}

function updateProgress(panel, now) {
  const elapsed = now.getTime() - panel.offsetMs;
  const phase = ((elapsed % panel.cycleMs) + panel.cycleMs) % panel.cycleMs;
  panel.progress.style.transform = `scaleX(${(phase / panel.cycleMs).toFixed(6)})`;
}

function measurePanelFontSize(panel, lines, language) {
  const probe = panel.lines[0].root.cloneNode(true);
  const typed = probe.querySelector('.typed');
  probe.querySelector('.cursor').remove();
  Object.assign(probe.style, {
    position: 'absolute', left: '-10000px', top: '0', width: 'max-content',
    maxWidth: 'none', overflow: 'visible', visibility: 'hidden'
  });
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
    if (widthAt(middle) <= PANEL_TEXT_WIDTH - 12) low = middle;
    else high = middle;
  }
  probe.remove();
  return Math.floor(low * 100) / 100;
}

function setPanelSize(panel, lines, language) {
  const size = measurePanelFontSize(panel, lines, language);
  panel.message.style.setProperty('--message-size', `${size}px`);
  panel.lines.forEach((line) => { line.root.style.fontSize = `${size}px`; });
}

function setCursor(line, working, visible = true) {
  line.cursor.hidden = !visible;
  line.cursor.classList.toggle('blink', visible && !working);
}

function sleep(ms, token, panel) {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => token === panel.token ? resolve() : reject(new DOMException('Superseded', 'AbortError')), ms);
  });
}

async function clearPanel(panel, token) {
  for (const line of [...panel.lines].reverse()) {
    setCursor(line, true);
    if (noAnimation || reducedMotion) {
      line.typed.textContent = '';
      setCursor(line, false, false);
      continue;
    }
    let text = line.typed.textContent;
    while (text.length) {
      text = text.slice(0, -1);
      line.typed.textContent = text;
      await sleep(12, token, panel);
    }
    setCursor(line, false, false);
  }
}

async function typePanel(panel, lines, token) {
  for (let index = 0; index < panel.lines.length; index += 1) {
    const line = panel.lines[index];
    setCursor(line, true);
    line.typed.textContent = '';
    if (noAnimation || reducedMotion) {
      line.typed.textContent = lines[index];
    } else {
      for (const character of lines[index]) {
        line.typed.textContent += character;
        await sleep(panel.name === 'centre' ? 24 : 20, token, panel);
      }
    }
    setCursor(line, false, index === panel.lines.length - 1);
  }
}

async function transition(panel, office, lines, key) {
  const token = ++panel.token;
  panel.message.lang = office.language;
  try {
    if (panel.rendered.some(Boolean)) await clearPanel(panel, token);
    setPanelSize(panel, lines, office.language);
    panel.office = office;
    panel.rendered = [...lines];
    panel.cadenceKey = key;
    await typePanel(panel, lines, token);
  } catch (error) {
    if (error?.name !== 'AbortError') throw error;
  }
}

function update(now) {
  for (const panel of Object.values(panels)) {
    const office = officeFor(panel, now);
    const parts = getZonedParts(now, office);
    panel.title.innerHTML = EnglishTitle(office, parts);
    const key = cadenceKey(panel, office, parts, now);
    if (key !== panel.cadenceKey) transition(panel, office, messageFor(panel, office, parts, now), key);
    updateProgress(panel, now);
  }
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
  const secondKey = Math.floor(now.getTime() / 1000);
  if (secondKey !== lastSecond) {
    lastSecond = secondKey;
    update(now);
  }
  requestAnimationFrame(tick);
}

window.addEventListener('resize', scaleStage, { passive: true });
window.addEventListener('orientationchange', scaleStage, { passive: true });
window.visualViewport?.addEventListener('resize', scaleStage, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    lastSecond = '';
    Object.values(panels).forEach((panel) => { panel.cadenceKey = ''; });
    scaleStage();
  }
});

await document.fonts.ready;
scaleStage();
requestAnimationFrame(tick);

window.__clock = Object.freeze({
  get panels() {
    return Object.fromEntries(Object.entries(panels).map(([name, panel]) => [name, {
      office: panel.office?.id || null,
      title: panel.title.textContent,
      lines: panel.lines.map((line) => line.typed.textContent),
      progress: Number(panel.progress.style.transform.match(/scaleX\(([^)]+)/)?.[1] || 0)
    }]));
  }
});
