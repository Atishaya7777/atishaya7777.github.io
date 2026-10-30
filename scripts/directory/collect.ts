import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Discipline, Professor } from '../../src/lib/directory/types';
import { normalize } from '../../src/lib/directory/model';
import { extract, extractionRules } from './codex';
import { fetchPage, relatedLinks, download, type SourcePage } from './network';
import { mergeProfessor, stableId } from './merge';
import { assertUniversity, loadData, readJson, ROOT, sha256, WORK } from './validation';
import { saveReport, type RunReport } from './report';
import { collectionDue } from './schedule-state';

interface Roster { url: string; department: string; discipline: Discipline }
export interface RegistryEntry { id: string; name: string; province: string; rosters: Roster[] }
interface Discovered { name: string; sortName: string; department: string; disciplines: Discipline[]; profileUrl: string; identityQuote: string }
export interface CollectOptions { run?: string; university?: string; limit: number; perUniversity?: number; discover: boolean; scheduled: boolean }
const errorText = (error: unknown) => error instanceof Error ? error.message : String(error);
export function verifyExtracted(p: Professor, expected: Professor, pages: SourcePage[]): void {
  if (p.id !== expected.id || p.name !== expected.name || p.universityId !== expected.universityId || p.department !== expected.department) throw new Error(`Extraction changed identity: ${expected.id}`);
  const sources = new Map(pages.map(page => [page.url, page]));
  for (const evidence of [p.identityEvidence, ...p.recruitment.map(c => c.evidence), ...p.funding.map(c => c.evidence)]) {
    const page = sources.get(evidence.url);
    if (!page || !normalize(page.text).includes(normalize(evidence.quote))) throw new Error(`Unsupported evidence passage: ${p.id} ${evidence.url}`);
    evidence.checkedAt = page.checkedAt;
  }
  for (const claim of p.recruitment) if (claim.status === 'opening' && !/\b(?:graduate|postgraduate|ph\.?d|doctoral|masters?|m\.?sc|m\.?math|masc|doctorat|maîtrise|cycle)\b/i.test(claim.evidence.quote)) throw new Error(`Opening evidence must explicitly concern graduate study: ${p.id}`);
  for (const claim of p.funding) if (claim.status === 'position' && !/fund|stipend|scholarship|financ|bourse|rémun|remun/i.test(claim.evidence.quote)) throw new Error(`Position funding requires explicit financial evidence: ${p.id}`);
  const allowed = new Set([...pages.map(page => page.url), ...pages.flatMap(page => page.links.map(link => link.url))]);
  if (p.links.some(link => !allowed.has(link.url) && !expected.links.some(old => old.url === link.url))) throw new Error(`Unobserved profile link: ${p.id}`);
  p.portrait = null;
}
async function proposePortrait(p: Professor, pages: SourcePage[], directory: string, report: RunReport): Promise<void> {
  if (p.portrait) return;
  for (const page of pages) {
    // A shared roster/group listing cannot establish an individual portrait association.
    if (page.url === p.identityEvidence.url && !p.links.some(l => l.url === page.url && l.url !== p.identityEvidence.url)) {
      const registry = await readJson<RegistryEntry[]>(path.join(ROOT, 'directory/registry.json'));
      if (registry.flatMap(u => u.rosters).some(r => r.url === page.url)) continue;
    }
    for (const image of page.images) {
      const context = normalize(`${image.alt} ${image.context}`);
      if (!context.includes(normalize(p.name)) || /logo|group photo|team photo|banner|icon|placeholder|default[-_ ]/.test(context + ' ' + image.url.toLowerCase())) continue;
      try {
        const response = await download(image.url, 5_000_000);
        const extension = imageExtension(response.bytes);
        if (!extension) continue;
        const hash = sha256(response.bytes);
        if (report.portraits.some(candidate => candidate.sha256 === hash)) continue;
        const file = `portraits/${p.id}-${hash}.${extension}`;
        await mkdir(path.join(directory, 'portraits'), { recursive: true });
        await writeFile(path.join(directory, file), response.bytes);
        report.portraits.push({ professorId: p.id, universityId: p.universityId, name: p.name, department: p.department, sourcePage: page.url, imageUrl: image.url, sha256: hash, file, extension, context: image.context || image.alt });
        return;
      } catch (error) { report.notes.push(`Portrait candidate skipped for ${p.id}: ${errorText(error)}`); }
    }
  }
}
export function imageExtension(bytes: Buffer): string | null {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'jpg';
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'png';
  if (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}
export async function collect(options: CollectOptions): Promise<void> {
  await mkdir(WORK, { recursive: true });
  if (options.scheduled) {
    try { const last = await readJson<{ completedAt: string }>(path.join(WORK, 'last-complete.json')); if (!collectionDue(last.completedAt)) { console.log('Weekly collection is not due.'); return; } } catch { /* No successful prior run. */ }
    if (!options.run) {
      try {
        const id = (await readFile(path.join(WORK, 'latest-run'), 'utf8')).trim();
        if (/^[a-zA-Z0-9-]+$/.test(id)) {
          const previous = await readJson<RunReport>(path.join(WORK, 'runs', id, 'report.json'));
          if (previous.status !== 'complete') options.run = id;
        }
      } catch { /* Start a new scheduled batch. */ }
    }
  }
  const registry = await readJson<RegistryEntry[]>(path.join(ROOT, 'directory/registry.json'));
  if (options.university && !registry.some(u => u.id === options.university)) throw new Error('Unknown university');
  const runId = options.run ?? new Date().toISOString().replace(/[:.]/g, '-');
  if (!/^[a-zA-Z0-9-]+$/.test(runId)) throw new Error('Invalid run ID');
  const directory = path.join(WORK, 'runs', runId);
  await mkdir(directory, { recursive: true });
  const baseline = await loadData();
  let report: RunReport;
  if (options.run) { report = await readJson<RunReport>(path.join(directory, 'report.json')); report.notes.push(...report.failures.map(f => `Previous attempt: ${f}`)); report.failures = []; }
  else report = { schemaVersion: 1, runId, startedAt: new Date().toISOString(), completedAt: null, status: 'running', failures: [], changes: [], universities: structuredClone(baseline), portraits: [], completedIds: [], completedRosters: [], notes: [] };
  report.status = 'running';
  await writeFile(path.join(WORK, 'latest-run'), runId);
  await saveReport(directory, report);
  let processed = 0;
  try {
    for (const university of registry.filter(u => !options.university || u.id === options.university)) {
      const data = report.universities.find(u => u.university.id === university.id)!;
      if (options.discover) for (const roster of university.rosters) {
        if (report.completedRosters.includes(roster.url)) continue;
        try {
          console.log(`Discovering ${university.name}: ${roster.department}`);
          const page = await fetchPage(roster.url);
          const discovery = await extract<{ people: Discovered[]; notes: string[] }>(`${extractionRules}\nIdentify research faculty only (professor/associate/assistant professor), excluding staff, students, emeritus, and teaching-only appointments unless supervision eligibility is explicit. Use only profile URLs present in supplied links, or the roster URL if there is no individual link. Department must be ${JSON.stringify(roster.department)} and discipline ${roster.discipline}. Up to 30 people.\n${JSON.stringify({ university, roster, page })}`, 'discovery', directory);
          report.notes.push(...discovery.notes.map(note => `${university.id}: ${note}`));
          for (const person of discovery.people) {
            if (!person.name.trim() || !page.text.includes(person.identityQuote) || person.department !== roster.department || !person.disciplines.includes(roster.discipline)) throw new Error(`Unsupported roster identity: ${person.name}`);
            if (person.profileUrl !== page.url && !page.links.some(link => link.url === person.profileUrl)) throw new Error(`Profile URL absent from roster: ${person.name}`);
            const id = stableId(university.id, person.name);
            const previous = data.professors.find(p => p.id === id);
            if (previous) { if (previous.department !== person.department) report.notes.push(`Possible shared-name or cross-appointment identity needs review: ${id}`); continue; }
            data.professors.push({ id, name: person.name, sortName: person.sortName, universityId: university.id, department: roster.department, disciplines: [roster.discipline], interests: [], links: [{ kind: 'university', url: roster.url, label: 'Faculty roster' }, ...(person.profileUrl !== roster.url ? [{ kind: new URL(person.profileUrl).hostname.endsWith(new URL(roster.url).hostname.split('.').slice(-2).join('.')) ? 'university' as const : 'personal' as const, url: person.profileUrl, label: 'Original profile' }] : [])], identityEvidence: { url: page.url, quote: person.identityQuote, checkedAt: page.checkedAt, sourceDate: null }, recruitment: [], funding: [], applicationInstructions: null, conflicts: [], portrait: null });
          }
          report.completedRosters.push(roster.url);
        } catch (error) { report.failures.push(`Roster ${roster.url}: ${errorText(error)}`); }
        await saveReport(directory, report);
      }
      const targets = data.professors.filter(p => !report.completedIds.includes(p.id)).slice(0, options.perUniversity);
      for (let offset = 0; offset < targets.length && processed < options.limit; offset += 10) {
        const batch = targets.slice(offset, offset + Math.min(10, options.limit - processed));
        const documents: { professor: Professor; pages: SourcePage[] }[] = [];
        for (const professor of batch) {
          const pages: SourcePage[] = [];
          const initial = [...new Set([professor.identityEvidence.url, ...professor.links.map(l => l.url), ...professor.recruitment.map(c => c.evidence.url), ...professor.funding.map(c => c.evidence.url)])];
          const queue = initial.slice(0, 8);
          const visited = new Set<string>();
          while (queue.length && visited.size < 10) {
            const url = queue.shift()!; if (visited.has(url)) continue; visited.add(url);
            try { const page = await fetchPage(url); pages.push(page); if (!registry.flatMap(u => u.rosters).some(r => r.url === url)) for (const next of relatedLinks(page, professor.name)) if (!visited.has(next) && !queue.includes(next)) queue.push(next); }
            catch (error) { report.failures.push(`${professor.id}: ${errorText(error)}`); }
          }
          if (!pages.some(page => normalize(page.text).includes(normalize(professor.name)))) { report.failures.push(`${professor.id}: no successfully read page establishes the named identity`); continue; }
          const signature = sha256(JSON.stringify({ id: professor.id, name: professor.name, department: professor.department, pages: pages.map(page => [page.url, page.hash]).sort() }));
          try {
            const cached = await readJson<{ signature: string; professor: Professor }>(path.join(WORK, 'extractions', `${professor.id}.json`));
            if (cached.signature === signature) {
              verifyExtracted(cached.professor, professor, pages);
              const next = mergeProfessor(professor, cached.professor, new Set(pages.map(page => page.url)));
              data.professors[data.professors.findIndex(p => p.id === professor.id)] = next;
              report.completedIds.push(professor.id);
              await proposePortrait(next, pages, directory, report);
              continue;
            }
          } catch { /* Missing/invalid extraction cache: extract again. */ }
          documents.push({ professor, pages });
        }
        if (!documents.length) { processed += batch.length; continue; }
        try {
          const compact = documents.map(({ professor, pages }) => ({ professor, pages: pages.map(page => ({ url: page.url, checkedAt: page.checkedAt, text: compactText(page.text, professor.name), links: page.links.slice(0, 60) })) }));
          const result = await extract<{ professors: Professor[] }>(`${extractionRules}\nReturn one record per supplied professor. Preserve known identityEvidence if its page is supplied. Never replace a successful prior check timestamp on evidence from an unavailable source. Relevant source excerpts must be exact text from the associated page.\nDOCUMENTS:\n${JSON.stringify(compact)}`, 'extraction', directory);
          const duplicateIds = result.professors.map(p => p.id);
          if (new Set(duplicateIds).size !== duplicateIds.length) throw new Error('Duplicate output identities');
          for (const { professor, pages } of documents) {
            try {
              const candidate = result.professors.find(p => p.id === professor.id);
              if (!candidate) throw new Error(`Extraction omitted ${professor.id}`);
              verifyExtracted(candidate, professor, pages);
              const previous = baseline.find(u => u.university.id === university.id)?.professors.find(p => p.id === professor.id);
              const next = mergeProfessor(previous, candidate, new Set(pages.map(p => p.url)));
              assertUniversity({ ...data, professors: [next] });
              data.professors[data.professors.findIndex(p => p.id === professor.id)] = next;
              await mkdir(path.join(WORK, 'extractions'), { recursive: true });
              const signature = sha256(JSON.stringify({ id: professor.id, name: professor.name, department: professor.department, pages: pages.map(page => [page.url, page.hash]).sort() }));
              await writeFile(path.join(WORK, 'extractions', `${professor.id}.json`), JSON.stringify({ signature, professor: candidate }));
              report.completedIds.push(professor.id);
              await proposePortrait(next, pages, directory, report);
            } catch (error) { report.failures.push(`${professor.id}: ${errorText(error)}`); }
          }
        } catch (error) { report.failures.push(errorText(error)); if (/Codex exited|timed out/.test(errorText(error))) throw error; }
        processed += batch.length;
        await refreshChanges();
        await saveReport(directory, report);
        console.log(`${processed} processed; ${report.changes.length} proposed changes`);
      }
    }
  } catch (error) { if (!report.failures.includes(errorText(error))) report.failures.push(errorText(error)); }
  await refreshChanges();
  report.completedAt = new Date().toISOString();
  const remaining = report.universities.filter(u => !options.university || u.university.id === options.university).flatMap(u => u.professors).filter(p => !report.completedIds.includes(p.id)).length;
  if (remaining) report.notes.push(`${remaining} records remain unchecked in this batch. Resume with --run ${runId}; previous public records remain intact.`);
  report.status = report.failures.length || remaining ? 'partial' : 'complete';
  await saveReport(directory, report);
  if (report.status === 'complete') await writeFile(path.join(WORK, 'last-complete.json'), JSON.stringify({ completedAt: report.completedAt }));
  console.log(`Review ${report.status} run ${runId}: ${path.join(directory, 'index.html')}`);
  if (report.failures.length) process.exitCode = 1;

  async function refreshChanges() {
    report.changes = report.universities.flatMap(u => u.professors.flatMap(after => {
      const before = baseline.find(b => b.university.id === u.university.id)?.professors.find(p => p.id === after.id) ?? null;
      return JSON.stringify(before) === JSON.stringify(after) ? [] : [{ id: after.id, before, after }];
    }));
  }
}

export function compactText(text: string, name: string): string {
  if (text.length <= 24000) return text;
  const chunks = [text.slice(0, 3000)];
  const names = text.toLowerCase().indexOf(name.toLowerCase());
  if (names >= 0) chunks.push(text.slice(Math.max(0, names - 200), names + 2000));
  for (const match of text.matchAll(/recruit|prospective|accepting|openings|funded|stipend|graduate students|recrut|maîtrise|doctorat/gi)) {
    chunks.push(text.slice(Math.max(0, match.index! - 250), match.index! + 1600));
    if (chunks.join('\n').length > 21000) break;
  }
  return [...new Set(chunks)].join('\n[passage break]\n').slice(0, 24000);
}
