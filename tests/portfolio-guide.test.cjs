const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

const root = resolve(__dirname, '..');
const script = readFileSync(resolve(root, 'recruiter-assistant.js'), 'utf8');
// Skip UI initialization; exercise the same answer lookup used by the buttons.
const context = vm.createContext({ document: { querySelector: () => true } });
vm.runInContext(script, context);
const answer = context.portfolioGuideAnswer;

test('Amplify retains study size, measured result, and rollout population', () => {
  const result = answer('amplify');
  assert.match(result.body, /study of 10 account managers/);
  assert.match(result.body, /approximately 1,600/);
  assert.match(result.body, /45 to 5 minutes/);
  assert.match(result.body, /European engineering adapted it/);
});

test('commercial scope does not claim the portfolio as incremental revenue', () => {
  const result = answer('fees');
  assert.match(result.body, /171%.*41%/);
  assert.match(result.body, /across a \$16B\+ seller fee-incentive portfolio/);
  assert.doesNotMatch(result.body, /generated \$16B|delivered \$16B/);
  assert.match(result.body, /Senior Product Manager at Amazon/);
});

test('90-day answer does not invent past team size or commit to a delivery date', () => {
  assert.match(answer('ninety').body, /I would start/);
  assert.match(answer('ninety').body, /would shape the sequence/);
  assert.doesNotMatch(answer('ninety').body, /I (shipped|delivered|led)/);
});

test('scope answer distinguishes current title from target roles', () => {
  assert.match(answer('scope').body, /current title is Senior Product Manager at Amazon/);
  assert.match(answer('scope').body, /individual-contributor roles/);
});

test('unknown and prototype keys cannot return invented answers', () => {
  for (const key of ['unknown', '', '__proto__', 'constructor', undefined]) {
    assert.equal(answer(key), null);
  }
});

test('every reviewed answer links only to an existing local source and fragment', () => {
  for (const key of ['amplify', 'fees', 'ninety', 'scope']) {
    for (const source of answer(key).sources) {
      assert.match(source.url, /^\/[a-z-]+\.html(?:#[a-z-]+)?$/);
      const [path, fragment] = source.url.slice(1).split('#');
      const file = resolve(root, path);
      assert.ok(existsSync(file), source.url);
      if (fragment) assert.ok(readFileSync(file, 'utf8').includes(`id="${fragment}"`), source.url);
    }
  }
});

test('guide has no model calls, network posts, or browser storage', () => {
  assert.doesNotMatch(script, /\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage/);
  assert.match(script, /heading\.textContent = answer\.title/);
  assert.match(script, /body\.textContent = answer\.body/);
});
