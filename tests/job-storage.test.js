import assert from 'node:assert/strict';
import test from 'node:test';
import { parseJobActions, updateJobActions } from '../src/lib/job-storage.js';

test('recovers from absent, corrupt, or malformed stored data', () => {
  for (const raw of [null, '', 'broken', 'null', '[]', '{"saved":12,"applied":{}}']) {
    assert.deepEqual(parseJobActions(raw), { saved: [], applied: [] });
  }
  assert.deepEqual(parseJobActions('{"saved":["one","one",2],"applied":["two",null]}'), { saved: ['one'], applied: ['two'] });
});

test('saving toggles independently without mutating existing data', () => {
  const original = { saved: [], applied: ['application'] };
  const saved = updateJobActions(original, 'save', 'job');
  assert.deepEqual(saved, { saved: ['job'], applied: ['application'] });
  assert.deepEqual(updateJobActions(saved, 'save', 'job'), original);
  assert.deepEqual(original.saved, []);
});

test('applications persist through serialization and cannot be duplicated', () => {
  const initial = { saved: ['saved'], applied: [] };
  const applied = updateJobActions(initial, 'apply', 'job');
  const restored = parseJobActions(JSON.stringify(applied));
  assert.deepEqual({ saved: restored.saved, applied: restored.applied }, { saved: ['saved'], applied: ['job'] });
  assert.deepEqual(updateJobActions(restored, 'apply', 'job'), restored);
  assert.deepEqual(updateJobActions(restored, 'save', 'saved'), { ...restored, saved: [] });
});
