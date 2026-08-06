import test from 'node:test';
import assert from 'node:assert/strict';
import { MELBOURNE, OFFICES, englishTimePhrase, getZonedParts, localMessage, rotationPair } from '../core.js';

test('office pool includes required Aurecon offices', () => {
  const ids = new Set(OFFICES.map((office) => office.id));
  for (const id of ['hong-kong', 'shanghai', 'jakarta', 'manila', 'singapore', 'bangkok', 'ho-chi-minh-city', 'kuala-lumpur', 'macau']) {
    assert.ok(ids.has(id), `${id} is missing`);
  }
});

test('rotation always returns two different offices', () => {
  for (let minute = -50; minute < 500; minute += 1) {
    const [left, right] = rotationPair(minute);
    assert.notEqual(left.id, right.id);
  }
});

test('English phrases cover special minute structures', () => {
  assert.equal(englishTimePhrase(6, 0), "six o'clock");
  assert.equal(englishTimePhrase(6, 15), 'quarter past six');
  assert.equal(englishTimePhrase(6, 30), 'half past six');
  assert.equal(englishTimePhrase(6, 45), 'quarter to seven');
  assert.equal(englishTimePhrase(6, 59), 'one minute to seven');
});

test('all offices produce two non-empty local lines for all minutes', () => {
  for (const office of [MELBOURNE, ...OFFICES]) {
    for (let hour = 0; hour < 24; hour += 1) {
      for (let minute = 0; minute < 60; minute += 1) {
        const lines = localMessage(office, hour, minute, minute);
        assert.equal(lines.length, 2);
        assert.ok(lines[0].trim().length > 0);
        assert.ok(lines[1].trim().length > 0);
      }
    }
  }
});

test('time zones resolve expected simultaneous local hours', () => {
  const date = new Date('2026-08-06T00:00:00Z');
  assert.equal(getZonedParts(date, MELBOURNE).digital, '10:00:00');
  const hongKong = OFFICES.find((office) => office.id === 'hong-kong');
  const jakarta = OFFICES.find((office) => office.id === 'jakarta');
  assert.equal(getZonedParts(date, hongKong).digital, '08:00:00');
  assert.equal(getZonedParts(date, jakarta).digital, '07:00:00');
});
