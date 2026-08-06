const OFFICE_TITLES = Object.freeze({
  melbourne: ['Melbourne', 'Australia', 'Australia/Melbourne'],
  'hong-kong': ['Hong Kong', 'Hong Kong', 'Asia/Hong_Kong'],
  shanghai: ['Shanghai', 'China', 'Asia/Shanghai'],
  beijing: ['Beijing', 'China', 'Asia/Shanghai'],
  jakarta: ['Jakarta', 'Indonesia', 'Asia/Jakarta'],
  manila: ['Manila', 'Philippines', 'Asia/Manila'],
  singapore: ['Singapore', 'Singapore', 'Asia/Singapore'],
  bangkok: ['Bangkok', 'Thailand', 'Asia/Bangkok'],
  'ho-chi-minh-city': ['Ho Chi Minh City', 'Vietnam', 'Asia/Ho_Chi_Minh'],
  'kuala-lumpur': ['Kuala Lumpur', 'Malaysia', 'Asia/Kuala_Lumpur'],
  macau: ['Macau', 'Macau', 'Asia/Macau'],
  auckland: ['Auckland', 'New Zealand', 'Pacific/Auckland'],
  wellington: ['Wellington', 'New Zealand', 'Pacific/Auckland'],
  sydney: ['Sydney', 'Australia', 'Australia/Sydney'],
  brisbane: ['Brisbane', 'Australia', 'Australia/Brisbane']
});

const panelTitleIds = Object.freeze({ left: 'leftTitle', centre: 'centreTitle', right: 'rightTitle' });

function titleParts(now, timeZone) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-AU', {
    timeZone,
    hourCycle: 'h23',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    day: '2-digit',
    month: 'short'
  }).formatToParts(now).filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]));
  return {
    digital: `${parts.hour}:${parts.minute}:${parts.second}`,
    date: `${parts.weekday} ${parts.day} ${parts.month}`
  };
}

function refreshEnglishTitles() {
  const panels = window.__clock?.panels;
  if (!panels) return;
  const now = new Date();
  for (const [panelName, titleId] of Object.entries(panelTitleIds)) {
    const officeId = panels[panelName]?.office;
    const details = OFFICE_TITLES[officeId];
    const element = document.getElementById(titleId);
    if (!details || !element) continue;
    const [city, country, timeZone] = details;
    const parts = titleParts(now, timeZone);
    element.innerHTML = `<span class="city">${city}, ${country}</span><span class="clock">${parts.digital}</span><span class="date">${parts.date}</span>`;
  }
}

window.setInterval(refreshEnglishTitles, 250);
refreshEnglishTitles();
