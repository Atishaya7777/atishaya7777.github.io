import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'node:http';
import type { PortraitApproval } from '../../src/lib/directory/types';
import { assertPortrait, assertUniversity, DATA, loadData, readJson, ROOT, sha256, WORK } from './validation';
import { imageExtension } from './collect';
import type { RunReport } from './report';

export async function getRun(id?: string): Promise<{ directory: string; report: RunReport }> {
  const runId = id || (await readFile(path.join(WORK, 'latest-run'), 'utf8')).trim();
  if (!/^[a-zA-Z0-9-]+$/.test(runId)) throw new Error('Invalid run ID');
  const directory = path.join(WORK, 'runs', runId);
  const report = await readJson<RunReport>(path.join(directory, 'report.json'));
  if (report.runId !== runId) throw new Error('Run identity mismatch');
  return { directory, report };
}
function safeRunFile(root: string, relative: string): string {
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep)) throw new Error('File escapes review directory');
  return file;
}
export async function review(run?: string, port = 4322): Promise<void> {
  const { directory, report } = await getRun(run);
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url || '/', 'http://127.0.0.1').pathname);
      const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
      if (relative !== 'index.html' && relative !== 'report.json' && !/^portraits\/[a-z0-9-]+\.(jpg|png|webp)$/.test(relative)) { response.writeHead(404); response.end(); return; }
      const bytes = await readFile(safeRunFile(directory, relative));
      response.setHeader('Content-Type', relative.endsWith('.html') ? 'text/html; charset=utf-8' : relative.endsWith('.json') ? 'application/json' : relative.endsWith('.jpg') ? 'image/jpeg' : relative.endsWith('.png') ? 'image/png' : 'image/webp');
      response.setHeader('X-Content-Type-Options', 'nosniff');
      response.setHeader('Cache-Control', 'no-store');
      response.end(bytes);
    } catch { response.writeHead(404); response.end(); }
  });
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
  server.listen(port, '127.0.0.1', () => console.log(`Review ${report.runId}: http://127.0.0.1:${port} (local only; Ctrl-C to stop)`));
}
export async function approvePhoto(options: { run?: string; id: string; hash: string; reviewer: string; confirmed: boolean }): Promise<void> {
  if (!options.confirmed || !options.reviewer.trim() || !/^[a-f0-9]{64}$/.test(options.hash)) throw new Error('Photo approval requires --id, --sha256, --reviewer, and --confirm-identity after checking the named original profile');
  const { directory, report } = await getRun(options.run);
  const candidate = report.portraits.find(p => p.professorId === options.id && p.sha256 === options.hash);
  const professor = report.universities.flatMap(u => u.professors).find(p => p.id === options.id);
  if (!candidate || !professor || candidate.name !== professor.name || candidate.universityId !== professor.universityId || candidate.department !== professor.department) throw new Error('Candidate professor identity does not match');
  const bytes = await readFile(safeRunFile(directory, candidate.file));
  if (sha256(bytes) !== options.hash || imageExtension(bytes) !== candidate.extension) throw new Error('Candidate image bytes/type changed; collect and review again');
  const manifest = path.join(ROOT, 'directory/portrait-approvals.json');
  const approvals = await readJson<PortraitApproval[]>(manifest);
  if (approvals.some(a => a.sha256 === options.hash && a.professorId !== options.id)) throw new Error('Image already associated with another professor; refusing approval');
  const asset = `/assets/grad-directory/${professor.id}-${options.hash}.${candidate.extension}`;
  const approval: PortraitApproval = { professorId: professor.id, universityId: professor.universityId, name: professor.name, department: professor.department, sourcePage: candidate.sourcePage, imageUrl: candidate.imageUrl, sha256: options.hash, path: asset, reviewer: options.reviewer, approvedAt: new Date().toISOString() };
  await mkdir(path.join(WORK, 'approved'), { recursive: true });
  await writeFile(path.join(WORK, 'approved', path.basename(asset)), bytes);
  if (!approvals.some(a => a.professorId === approval.professorId && a.sha256 === approval.sha256)) approvals.push(approval);
  await writeFile(manifest, JSON.stringify(approvals, null, 2) + '\n');
  console.log(`Approved exact portrait for ${professor.name}. It remains private until data promotion.`);
}
export async function promote(options: { run?: string; reviewed: boolean; ids: string[] }): Promise<void> {
  if (!options.reviewed) throw new Error('Review the report first, then supply --reviewed. Portrait approval is separate.');
  const { report } = await getRun(options.run);
  if (report.status === 'running') throw new Error('Collection is still running');
  const current = await loadData();
  const approvals = await readJson<PortraitApproval[]>(path.join(ROOT, 'directory/portrait-approvals.json'));
  const changes = report.changes.filter(change => !options.ids.length || options.ids.includes(change.id));
  if (options.ids.some(id => !changes.some(c => c.id === id) && !approvals.some(a => a.professorId === id))) throw new Error('A selected identity has no proposed change or portrait approval');
  for (const change of changes) {
    const data = current.find(u => u.university.id === change.after.universityId);
    if (!data) throw new Error(`Unknown university: ${change.after.universityId}`);
    const index = data.professors.findIndex(p => p.id === change.id);
    const before = index < 0 ? null : data.professors[index];
    // An approved image may have been promoted separately without changing the underlying data.
    const withoutPortrait = (p: typeof before) => p ? { ...p, portrait: null } : null;
    if (JSON.stringify(withoutPortrait(before)) !== JSON.stringify(withoutPortrait(change.before))) throw new Error(`Published input changed since collection: ${change.id}. Recollect before promoting.`);
    const next = structuredClone(change.after);
    next.portrait = before?.portrait ?? null;
    if (index < 0) data.professors.push(next); else data.professors[index] = next;
  }
  const staged = path.join(WORK, 'promotion-public');
  await mkdir(path.join(staged, 'assets/grad-directory'), { recursive: true });
  const copyImages: { from: string; to: string }[] = [];
  for (const data of current) {
    for (const professor of data.professors) {
      const selected = !options.ids.length || options.ids.includes(professor.id);
      const approval = selected ? approvals.filter(a => a.professorId === professor.id && a.universityId === professor.universityId && a.name === professor.name && a.department === professor.department).sort((a, b) => b.approvedAt.localeCompare(a.approvedAt))[0] : undefined;
      if (approval) {
        professor.portrait = { path: approval.path, sha256: approval.sha256 };
        const privatePath = path.join(WORK, 'approved', path.basename(approval.path));
        let from = privatePath;
        try { await readFile(privatePath); } catch { from = path.join(ROOT, 'public', approval.path); }
        const to = path.join(staged, approval.path);
        await copyFile(from, to);
        await assertPortrait(professor, approvals, staged);
        copyImages.push({ from: to, to: path.join(ROOT, 'public', approval.path) });
      } else await assertPortrait(professor, approvals);
    }
    assertUniversity(data);
  }
  // All records and image hashes pass before touching tracked data.
  for (const image of copyImages) { await mkdir(path.dirname(image.to), { recursive: true }); await copyFile(image.from, image.to); }
  for (const data of current) await writeFile(path.join(DATA, `${data.university.id}.json`), JSON.stringify(data, null, 2) + '\n');
  console.log(`Promoted ${changes.length} reviewed record changes and ${copyImages.length} approved portraits into website inputs. Inspect git diff and build before committing. Nothing was pushed.`);
}
