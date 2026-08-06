export const OFFICES = Object.freeze([
  { id: 'hong-kong', city: '香港', cityEnglish: 'Hong Kong', timeZone: 'Asia/Hong_Kong', locale: 'zh-HK', language: 'zh-Hant' },
  { id: 'shanghai', city: '上海', cityEnglish: 'Shanghai', timeZone: 'Asia/Shanghai', locale: 'zh-CN', language: 'zh-Hans' },
  { id: 'beijing', city: '北京', cityEnglish: 'Beijing', timeZone: 'Asia/Shanghai', locale: 'zh-CN', language: 'zh-Hans' },
  { id: 'jakarta', city: 'Jakarta', cityEnglish: 'Jakarta', timeZone: 'Asia/Jakarta', locale: 'id-ID', language: 'id' },
  { id: 'manila', city: 'Maynila', cityEnglish: 'Manila', timeZone: 'Asia/Manila', locale: 'fil-PH', language: 'fil' },
  { id: 'singapore', city: 'Singapore', cityEnglish: 'Singapore', timeZone: 'Asia/Singapore', locale: 'en-SG', language: 'en' },
  { id: 'bangkok', city: 'กรุงเทพมหานคร', cityEnglish: 'Bangkok', timeZone: 'Asia/Bangkok', locale: 'th-TH', language: 'th' },
  { id: 'ho-chi-minh-city', city: 'Thành phố Hồ Chí Minh', cityEnglish: 'Ho Chi Minh City', timeZone: 'Asia/Ho_Chi_Minh', locale: 'vi-VN', language: 'vi' },
  { id: 'kuala-lumpur', city: 'Kuala Lumpur', cityEnglish: 'Kuala Lumpur', timeZone: 'Asia/Kuala_Lumpur', locale: 'ms-MY', language: 'ms' },
  { id: 'macau', city: '澳門', cityEnglish: 'Macau', timeZone: 'Asia/Macau', locale: 'zh-MO', language: 'zh-Hant' },
  { id: 'auckland', city: 'Auckland', cityEnglish: 'Auckland', timeZone: 'Pacific/Auckland', locale: 'en-NZ', language: 'en' },
  { id: 'wellington', city: 'Wellington', cityEnglish: 'Wellington', timeZone: 'Pacific/Auckland', locale: 'en-NZ', language: 'en' },
  { id: 'sydney', city: 'Sydney', cityEnglish: 'Sydney', timeZone: 'Australia/Sydney', locale: 'en-AU', language: 'en' },
  { id: 'brisbane', city: 'Brisbane', cityEnglish: 'Brisbane', timeZone: 'Australia/Brisbane', locale: 'en-AU', language: 'en' }
]);

export const MELBOURNE = Object.freeze({
  id: 'melbourne', city: 'Melbourne', cityEnglish: 'Melbourne',
  timeZone: 'Australia/Melbourne', locale: 'en-AU', language: 'en'
});

const EN_ONES = Object.freeze([
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen'
]);
const EN_TENS = Object.freeze({ 20: 'twenty', 30: 'thirty', 40: 'forty', 50: 'fifty' });

export function englishNumber(value) {
  if (value < 20) return EN_ONES[value];
  const tens = Math.floor(value / 10) * 10;
  const ones = value % 10;
  return ones === 0 ? EN_TENS[tens] : `${EN_TENS[tens]}-${EN_ONES[ones]}`;
}

function englishHour(hour24) {
  return englishNumber(hour24 % 12 || 12);
}

export function englishTimePhrase(hour, minute) {
  if (minute === 0) return `${englishHour(hour)} o'clock`;
  if (minute === 15) return `quarter past ${englishHour(hour)}`;
  if (minute === 30) return `half past ${englishHour(hour)}`;
  if (minute === 45) return `quarter to ${englishHour(hour + 1)}`;
  if (minute < 30) {
    const unit = minute === 1 ? 'minute' : 'minutes';
    return `${englishNumber(minute)} ${unit} past ${englishHour(hour)}`;
  }
  const remaining = 60 - minute;
  const unit = remaining === 1 ? 'minute' : 'minutes';
  return `${englishNumber(remaining)} ${unit} to ${englishHour(hour + 1)}`;
}

function chineseNumber(value) {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (value < 10) return digits[value];
  if (value === 10) return '十';
  if (value < 20) return `十${digits[value - 10]}`;
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return `${digits[tens]}十${ones === 0 ? '' : digits[ones]}`;
}

function austronesianNumber(value, zeroWord = 'nol') {
  const ones = [zeroWord, 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];
  if (value < 10) return ones[value];
  if (value === 10) return 'sepuluh';
  if (value === 11) return 'sebelas';
  if (value < 20) return `${ones[value - 10]} belas`;
  const tens = Math.floor(value / 10);
  const remainder = value % 10;
  return `${ones[tens]} puluh${remainder === 0 ? '' : ` ${ones[remainder]}`}`;
}

function tagalogNumber(value) {
  const basics = ['sero', 'isa', 'dalawa', 'tatlo', 'apat', 'lima', 'anim', 'pito', 'walo', 'siyam', 'sampu'];
  if (value <= 10) return basics[value];
  const teens = { 11: 'labing-isa', 12: 'labindalawa', 13: 'labintatlo', 14: 'labing-apat', 15: 'labinlima', 16: 'labing-anim', 17: 'labimpito', 18: 'labingwalo', 19: 'labinsiyam' };
  if (value < 20) return teens[value];
  const tensWords = { 2: 'dalawampu', 3: 'tatlumpu', 4: 'apatnapu', 5: 'limampu' };
  const tens = Math.floor(value / 10);
  const remainder = value % 10;
  return `${tensWords[tens]}${remainder === 0 ? '' : `’t ${basics[remainder]}`}`;
}

function tagalogHour(hour24) {
  const words = ['dose', 'una', 'dos', 'tres', 'kwatro', 'singko', 'sais', 'siyete', 'otso', 'nuwebe', 'diyes', 'onse'];
  return words[hour24 % 12];
}

function thaiNumber(value) {
  const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  if (value < 10) return digits[value];
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  const tensText = tens === 1 ? 'สิบ' : tens === 2 ? 'ยี่สิบ' : `${digits[tens]}สิบ`;
  const onesText = ones === 0 ? '' : ones === 1 ? 'เอ็ด' : digits[ones];
  return `${tensText}${onesText}`;
}

function vietnameseNumber(value) {
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  if (value < 10) return digits[value];
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  const tensText = tens === 1 ? 'mười' : `${digits[tens]} mươi`;
  let onesText = '';
  if (ones === 1 && tens > 1) onesText = ' mốt';
  else if (ones === 4 && tens > 1) onesText = ' tư';
  else if (ones === 5) onesText = ' lăm';
  else if (ones > 0) onesText = ` ${digits[ones]}`;
  return `${tensText}${onesText}`;
}

export function localMessage(office, hour, minute, leadIndex = 0) {
  switch (office.language) {
    case 'zh-Hant': return ['現在時間是', `${chineseNumber(hour)}時${chineseNumber(minute)}分`];
    case 'zh-Hans': return ['现在时间是', `${chineseNumber(hour)}时${chineseNumber(minute)}分`];
    case 'id': return ['Waktu sekarang', minute === 0 ? `pukul ${austronesianNumber(hour)} tepat` : `pukul ${austronesianNumber(hour)} lewat ${austronesianNumber(minute)} menit`];
    case 'ms': return ['Waktu sekarang', minute === 0 ? `pukul ${austronesianNumber(hour, 'kosong')} tepat` : `pukul ${austronesianNumber(hour, 'kosong')} lewat ${austronesianNumber(minute, 'kosong')} minit`];
    case 'fil': return ['Ang oras ngayon ay', minute === 0 ? `alas ${tagalogHour(hour)} eksakto` : `alas ${tagalogHour(hour)} at ${tagalogNumber(minute)}`];
    case 'th': return ['ขณะนี้เวลา', `${thaiNumber(hour)} นาฬิกา ${thaiNumber(minute)} นาที`];
    case 'vi': return ['Bây giờ là', `${vietnameseNumber(hour)} giờ ${vietnameseNumber(minute)} phút`];
    default: {
      const leads = ['The time now is', 'Right now, it is', 'At this moment, it is'];
      return [leads[leadIndex % leads.length], englishTimePhrase(hour, minute)];
    }
  }
}

export function getZonedParts(date, office) {
  const parts = new Intl.DateTimeFormat(office.locale, {
    timeZone: office.timeZone,
    hourCycle: 'h23',
    numberingSystem: 'latn',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
  }).formatToParts(date);
  const values = Object.create(null);
  for (const part of parts) if (part.type !== 'literal') values[part.type] = part.value;
  return {
    hour: Number(values.hour), minute: Number(values.minute), second: Number(values.second),
    weekday: values.weekday, day: values.day, month: values.month, year: values.year,
    digital: `${String(values.hour).padStart(2, '0')}:${String(values.minute).padStart(2, '0')}:${String(values.second).padStart(2, '0')}`,
    dateText: `${values.weekday} ${values.day} ${values.month} ${values.year}`
  };
}

export function rotationPair(epochMinute, offices = OFFICES) {
  const leftIndex = ((epochMinute % offices.length) + offices.length) % offices.length;
  let rightIndex = (leftIndex + Math.ceil(offices.length / 2)) % offices.length;
  if (rightIndex === leftIndex) rightIndex = (rightIndex + 1) % offices.length;
  return [offices[leftIndex], offices[rightIndex]];
}
