import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import type { Evidence, PortraitApproval, Professor, UniversityData } from '../../src/lib/directory/types';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const DATA = path.join(ROOT, 'src/data/grad-directory');
export const WORK = path.join(ROOT, '.directory-work');
export const sha256 = (data: string | Buffer) => createHash('sha256').update(data).digest('hex');
export const readJson = async <T = unknown>(file: string): Promise<T> => JSON.parse(await readFile(file, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: true });
const schema = await readJson<object>(path.join(ROOT, 'directory/schemas/university.schema.json'));
const validate = ajv.compile<UniversityData>(schema);

export function assertEvidence(e: Evidence): void {
  if (!Number.isFinite(Date.parse(e.checkedAt)) || Date.parse(e.checkedAt) > Date.now() + 300000) throw new Error(`Invalid/future checkedAt: ${e.checkedAt}`);
  if (!e.quote.trim()) throw new Error('Evidence must contain a supporting passage');
}
export function assertUniversity(data: unknown): asserts data is UniversityData {
  if (!validate(data)) throw new Error(ajv.errorsText(validate.errors, { separator: '\n' }));
  const ids = new Set<string>();
  for (const p of data.professors) {
    if (p.universityId !== data.university.id || !p.id.startsWith(`${p.universityId}-`)) throw new Error(`Identity/university mismatch: ${p.id}`);
    if (ids.has(p.id)) throw new Error(`Duplicate identity: ${p.id}`);
    ids.add(p.id);
    if (!p.links.some(l => l.kind === 'university')) throw new Error(`Missing institutional source: ${p.id}`);
    for (const e of [p.identityEvidence, ...p.recruitment.map(c => c.evidence), ...p.funding.map(c => c.evidence)]) assertEvidence(e);
    for (const c of p.recruitment) if (c.validUntil && (!Number.isFinite(Date.parse(c.validUntil)) || new Date(c.validUntil).toISOString().slice(0, 10) !== c.validUntil)) throw new Error(`Invalid deadline: ${p.id}`);
  }
}
export async function loadData(): Promise<UniversityData[]> {
  const files = (await readdir(DATA)).filter(f => f.endsWith('.json')).sort();
  const data = await Promise.all(files.map(file => readJson<UniversityData>(path.join(DATA, file))));
  const ids = new Set<string>();
  for (const university of data) {
    assertUniversity(university);
    for (const p of university.professors) { if (ids.has(p.id)) throw new Error(`Duplicate global identity ${p.id}`); ids.add(p.id); }
  }
  return data;
}
export async function assertPortrait(p: Professor, approvals: PortraitApproval[], publicRoot = path.join(ROOT, 'public')): Promise<void> {
  if (!p.portrait) return;
  const portrait = p.portrait;
  const approval = approvals.find(a => a.professorId === p.id && a.universityId === p.universityId && a.name === p.name && a.department === p.department && a.sha256 === portrait.sha256 && a.path === portrait.path);
  if (!approval || !approval.reviewer?.trim() || !Number.isFinite(Date.parse(approval.approvedAt))) throw new Error(`Unapproved portrait identity/file: ${p.id}`);
  if (!/^https?:\/\//.test(approval.sourcePage) || !/^https?:\/\//.test(approval.imageUrl)) throw new Error(`Missing portrait provenance: ${p.id}`);
  if (!portrait.path.startsWith(`/assets/grad-directory/${p.id}-${portrait.sha256}.`) || !/^\/assets\/grad-directory\/[a-z0-9-]+-[a-f0-9]{64}\.(jpg|png|webp)$/.test(portrait.path)) throw new Error(`Invalid portrait path: ${p.id}`);
  const image = await readFile(path.join(publicRoot, portrait.path));
  if (sha256(image) !== portrait.sha256) throw new Error(`Portrait bytes changed: ${p.id}`);
  if (approvals.some(a => a.sha256 === portrait.sha256 && a.professorId !== p.id)) throw new Error(`Identical portrait assigned to different professors: ${p.id}`);
}
export async function validatePublic(): Promise<void> {
  const data = await loadData();
  const approvals = await readJson<PortraitApproval[]>(path.join(ROOT, 'directory/portrait-approvals.json'));
  if (!Array.isArray(approvals)) throw new Error('Portrait approval manifest must be an array');
  for (const p of data.flatMap(u => u.professors)) await assertPortrait(p, approvals);
  console.log(`Directory valid: ${data.length} universities, ${data.reduce((n, u) => n + u.professors.length, 0)} professors; portrait approvals checked.`);
}
