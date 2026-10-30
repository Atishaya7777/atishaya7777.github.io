import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { Professor, PortraitApproval, RecruitmentClaim } from '../../src/lib/directory/types';
import { currentOpening, emptyFilters, expired, filtersFromSearch, filtersToSearch, matchesProfessor, overdue } from '../../src/lib/directory/model';
import { mergeProfessor, stableId } from './merge';
import { assertPortrait, assertUniversity, sha256 } from './validation';
import { parsePage, type SourcePage } from './network';
import { verifyExtracted } from './collect';
import { escapeHtml, saveReport, type RunReport } from './report';
import { collectionDue } from './schedule-state';

const now = new Date('2026-10-29T16:00:00Z');
const evidence = { url: 'https://example.edu/people/raphael', quote: 'Raphaël Example is recruiting PhD students for Fall 2027.', checkedAt: '2026-10-28T12:00:00Z', sourceDate: null };
const opening: RecruitmentClaim = { status: 'opening', degree: 'phd', intake: 'Fall 2027', validUntil: null, summary: 'PhD recruitment for Fall 2027.', evidence };
const base = (): Professor => ({ id: 'example-raphael-example', name: 'Raphaël Example', sortName: 'Example, Raphaël', universityId: 'example', department: 'Department of Computer Science', disciplines: ['cs'], interests: ['Graph theory'], links: [{ kind: 'university', url: evidence.url, label: 'Institutional profile' }], identityEvidence: evidence, recruitment: [], funding: [], applicationInstructions: null, conflicts: [], portrait: null });
const data = (p: Professor) => ({ schemaVersion: 1, university: { id: 'example', name: 'Example University', province: 'Manitoba' }, coverage: 'Partial test coverage.', professors: [p] });
const page = (text = evidence.quote): SourcePage => ({ url: evidence.url, text, checkedAt: evidence.checkedAt, hash: sha256(text), changed: true, links: [], images: [] });

test('same-name identities stay separate across universities; reassignments are rejected', () => {
  assert.notEqual(stableId('alberta', 'Alex Kim'), stableId('toronto', 'Alex Kim'));
  assert.throws(() => mergeProfessor(base(), { ...base(), department: 'Department of Mathematics' }, new Set()), /identity reassignment/);
});
test('missing recruitment never becomes closed and failed fetches preserve prior evidence dates', () => {
  const previous = base(); previous.recruitment = [opening];
  const merged = mergeProfessor(previous, base(), new Set(['https://example.edu/unrelated']));
  assert.deepEqual(merged.recruitment, [opening]);
  assert.equal(base().recruitment.length, 0);
});
test('expired dated evidence remains in the profile when a source changes', () => {
  const previous = base(); previous.recruitment = [{ ...opening, intake: 'Fall 2025' }];
  assert.equal(mergeProfessor(previous, base(), new Set([evidence.url])).recruitment.length, 1);
});
test('conflicting open and closed statements are surfaced and excluded from openings-only', () => {
  const candidate = base(); candidate.recruitment = [opening, { ...opening, status: 'closed', evidence: { ...evidence, url: 'https://example.edu/lab' } }];
  const p = mergeProfessor(undefined, candidate, new Set());
  assert.ok(p.conflicts.length);
  assert.equal(matchesProfessor(p, { ...emptyFilters, recruitment: 'opening' }, 'Example University', now), false);
});
test('past intakes, passed deadlines, and overdue checks are excluded', () => {
  assert.equal(currentOpening(opening, now), true);
  assert.equal(expired({ ...opening, intake: 'Fall 2026' }, now), true);
  assert.equal(currentOpening({ ...opening, validUntil: '2026-10-28' }, now), false);
  assert.equal(overdue('2026-06-01T00:00:00Z', now), true);
  assert.equal(currentOpening({ ...opening, evidence: { ...evidence, checkedAt: '2026-06-01T00:00:00Z' } }, now), false);
});
test('keyword normalization and degree/intake constraints apply to the same recruitment claim', () => {
  const p = base(); p.recruitment = [opening, { ...opening, degree: 'masters', status: 'closed', intake: 'Winter 2027' }];
  assert.equal(matchesProfessor(p, { ...emptyFilters, q: 'raphael graph', degree: 'phd', intake: 'Fall 2027', recruitment: 'opening' }, 'Example University', now), true);
  assert.equal(matchesProfessor(p, { ...emptyFilters, degree: 'masters', recruitment: 'opening' }, 'Example University', now), false);
  assert.equal(matchesProfessor(p, { ...emptyFilters, degree: 'masters', intake: 'Fall 2027' }, 'Example University', now), false);
});
test('departmental funding is never a funded-position filter match', () => {
  const p = base(); p.funding = [{ status: 'program', degree: 'phd', intake: null, summary: 'Program funding policy.', evidence }];
  assert.equal(matchesProfessor(p, { ...emptyFilters, funding: 'position' }, 'Example University', now), false);
  assert.equal(matchesProfessor(p, { ...emptyFilters, funding: 'program' }, 'Example University', now), true);
});
test('filter state round-trips Unicode, punctuation, and intake labels through URLs', () => {
  const filters = { ...emptyFilters, q: 'Raphaël & graphs', university: 'example', intake: 'Fall 2027' };
  assert.deepEqual(filtersFromSearch(filtersToSearch(filters)), filters);
});
test('weekly scheduling catches Monday and overdue logins without duplicate same-week runs', () => {
  assert.equal(collectionDue(null, now), true);
  assert.equal(collectionDue('2026-10-26T16:00:00Z', now), false);
  assert.equal(collectionDue('2026-10-19T16:00:00Z', now), true);
  assert.equal(collectionDue('2026-10-22T16:00:00Z', new Date('2026-10-26T13:59:00Z')), false);
  assert.equal(collectionDue('2026-10-22T16:00:00Z', new Date('2026-10-26T14:00:00Z')), true);
});
test('shared lab pages cannot introduce unobserved links or unsupported statements', () => {
  const p = base(); p.recruitment = [opening];
  verifyExtracted(p, base(), [page()]);
  p.recruitment[0].evidence = { ...evidence, quote: 'Guaranteed fully funded admission.' };
  assert.throws(() => verifyExtracted(p, base(), [page()]), /Unsupported evidence/);
  const wrong = base(); wrong.links.push({ kind: 'personal', url: 'https://unseen.example/profile', label: 'Profile' });
  assert.throws(() => verifyExtracted(wrong, base(), [page()]), /Unobserved profile/);
});
test('undergraduate-only recruitment cannot be promoted into a graduate opening', () => {
  const p = base(); p.recruitment = [{ ...opening, evidence: { ...evidence, quote: 'We welcome undergraduate research assistants.' } }];
  assert.throws(() => verifyExtracted(p, base(), [page(evidence.quote + ' We welcome undergraduate research assistants.')]), /graduate study/);
});
test('HTML parsing preserves named image context and ignores page scripts/navigation', () => {
  const parsed = parsePage('<nav>unrelated</nav><main><h1>Raphaël Example</h1><figure><img src="/portrait.jpg" alt="Raphaël Example"><figcaption>Raphaël Example, Example University</figcaption></figure><script>doBadThings()</script><a href="/lab">Lab</a></main>', evidence.url);
  assert.ok(parsed.text.includes('Raphaël Example'));
  assert.ok(!parsed.text.includes('doBadThings'));
  assert.ok(!parsed.text.includes('unrelated'));
  assert.equal(parsed.images[0].url, 'https://example.edu/portrait.jpg');
  assert.ok(parsed.images[0].context.includes('Example University'));
});
test('schema rejects incorrect affiliations and duplicate professor IDs', () => {
  assertUniversity(data(base()));
  assert.throws(() => assertUniversity(data({ ...base(), universityId: 'different' })), /mismatch/);
  assert.throws(() => assertUniversity({ ...data(base()), professors: [base(), base()] }), /Duplicate/);
});
test('portrait publication rejects missing approval, different identities, and changed bytes', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'grad-portrait-test-'));
  const bytes = Buffer.from('exact approved image bytes'); const hash = sha256(bytes);
  const asset = `/assets/grad-directory/${base().id}-${hash}.png`;
  await mkdir(path.join(root, 'assets/grad-directory'), { recursive: true });
  await writeFile(path.join(root, asset), bytes);
  const p = { ...base(), portrait: { path: asset, sha256: hash } };
  const approval: PortraitApproval = { professorId: p.id, universityId: p.universityId, name: p.name, department: p.department, sourcePage: evidence.url, imageUrl: 'https://example.edu/portrait.png', sha256: hash, path: asset, reviewer: 'Test reviewer', approvedAt: '2026-10-28T00:00:00Z' };
  await assert.rejects(assertPortrait(p, [], root), /Unapproved/);
  await assert.rejects(assertPortrait(p, [{ ...approval, professorId: 'different-person' }], root), /Unapproved/);
  await assert.rejects(assertPortrait(p, [{ ...approval, name: 'Different Person' }], root), /Unapproved/);
  await assertPortrait(p, [approval], root);
  await writeFile(path.join(root, asset), 'changed bytes at the same path');
  await assert.rejects(assertPortrait(p, [approval], root), /bytes changed/);
});
test('review checkpoints preserve progress and escape untrusted source HTML', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'grad-report-test-'));
  const report: RunReport = { schemaVersion: 1, runId: 'test-run', startedAt: now.toISOString(), completedAt: null, status: 'running', failures: ['HTTP 503: profile unavailable'], changes: [], universities: [], portraits: [], completedIds: ['example-done'], completedRosters: [], notes: ['<script>alert(1)</script>'] };
  await saveReport(directory, report);
  const restored = JSON.parse(await readFile(path.join(directory, 'report.json'), 'utf8'));
  assert.deepEqual(restored.completedIds, ['example-done']);
  assert.deepEqual(restored.failures, report.failures);
  const html = await readFile(path.join(directory, 'index.html'), 'utf8');
  assert.ok(!html.includes('<script>alert(1)</script>'));
  assert.equal(escapeHtml('<script>'), '&lt;script&gt;');
});
