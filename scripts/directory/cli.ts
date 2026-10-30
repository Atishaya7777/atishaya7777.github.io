import { mkdir, open, readFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { collect } from './collect';
import { approvePhoto, promote, review } from './commands';
import { schedule } from './schedule';
import { validatePublic, WORK } from './validation';

const command = process.argv[2];
const { values } = parseArgs({ args: process.argv.slice(3).filter(a => a !== '--'), options: { run: { type: 'string' }, university: { type: 'string' }, limit: { type: 'string', default: '200' }, 'per-university': { type: 'string' }, discover: { type: 'boolean' }, scheduled: { type: 'boolean' }, reviewed: { type: 'boolean' }, id: { type: 'string', multiple: true }, sha256: { type: 'string' }, reviewer: { type: 'string' }, 'confirm-identity': { type: 'boolean' }, port: { type: 'string', default: '4322' }, install: { type: 'boolean' }, uninstall: { type: 'boolean' } } });
try {
  if (command === 'validate') await validatePublic();
  else if (command === 'review') await review(values.run, Number(values.port));
  else if (command === 'schedule') await schedule(Boolean(values.install), Boolean(values.uninstall));
  else if (['collect', 'approve-photo', 'promote'].includes(command)) {
    await mkdir(WORK, { recursive: true });
    // Collection writes private snapshots only. Human review/promotion can proceed
    // against a completed snapshot while another collection is running.
    const lock = path.join(WORK, command === 'collect' ? 'writer.lock' : 'publication.lock');
    try {
      const existing = JSON.parse(await readFile(lock, 'utf8'));
      try { process.kill(existing.pid, 0); throw new Error(`Directory writer already running (PID ${existing.pid})`); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error; }
      await unlink(lock);
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    const handle = await open(lock, 'wx');
    await handle.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    try {
      if (command === 'collect') {
        const limit = Number(values.limit);
        if (!Number.isInteger(limit) || limit < 1 || limit > 1000) throw new Error('--limit must be between 1 and 1000');
        const perUniversity = values['per-university'] ? Number(values['per-university']) : undefined;
        if (perUniversity !== undefined && (!Number.isInteger(perUniversity) || perUniversity < 1)) throw new Error('--per-university must be a positive integer');
        await collect({ run: values.run, university: values.university, limit, perUniversity, discover: Boolean(values.discover), scheduled: Boolean(values.scheduled) });
      } else if (command === 'approve-photo') {
        if (values.id?.length !== 1) throw new Error('Specify exactly one --id');
        await approvePhoto({ run: values.run, id: values.id[0], hash: values.sha256 ?? '', reviewer: values.reviewer ?? '', confirmed: Boolean(values['confirm-identity']) });
      } else await promote({ run: values.run, reviewed: Boolean(values.reviewed), ids: values.id ?? [] });
    } finally { await handle.close(); await unlink(lock); }
  } else throw new Error('Use: validate | collect | review | approve-photo | promote | schedule');
} catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
