import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import path from 'node:path';
import { ROOT, WORK } from './validation';
import { escapeHtml } from './report';

export async function schedule(install: boolean, uninstall: boolean): Promise<void> {
  if (process.platform !== 'darwin') throw new Error('The user-level scheduler requires macOS');
  const label = 'ca.atishaya.grad-directory';
  const file = path.join(homedir(), 'Library/LaunchAgents', `${label}.plist`);
  const domain = `gui/${process.getuid!()}`;
  if (uninstall) { try { execFileSync('/bin/launchctl', ['bootout', `${domain}/${label}`]); } catch { /* Already unloaded. */ } console.log(`Unloaded ${label}. The plist remains at ${file} for inspection.`); return; }
  await mkdir(path.join(WORK, 'schedule'), { recursive: true });
  let codex: string;
  try { codex = execFileSync('/usr/bin/which', ['codex'], { encoding: 'utf8' }).trim(); } catch { throw new Error('Install and sign into Codex CLI before installing the schedule'); }
  const args = [process.execPath, '--import', 'tsx', path.join(ROOT, 'scripts/directory/cli.ts'), 'collect', '--scheduled', '--discover', '--limit', '200'];
  const e = escapeHtml;
  const plist = `<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n<plist version="1.0"><dict><key>Label</key><string>${label}</string><key>ProgramArguments</key><array>${args.map(a => `<string>${e(a)}</string>`).join('')}</array><key>WorkingDirectory</key><string>${e(ROOT)}</string><key>EnvironmentVariables</key><dict><key>PATH</key><string>${e(`${path.dirname(process.execPath)}:${path.dirname(codex)}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`)}</string><key>DIRECTORY_CODEX_BIN</key><string>${e(codex)}</string><key>TZ</key><string>America/Winnipeg</string></dict><key>RunAtLoad</key><true/><key>StartCalendarInterval</key><dict><key>Weekday</key><integer>1</integer><key>Hour</key><integer>9</integer><key>Minute</key><integer>0</integer></dict><key>StandardOutPath</key><string>${e(path.join(WORK, 'schedule/stdout.log'))}</string><key>StandardErrorPath</key><string>${e(path.join(WORK, 'schedule/stderr.log'))}</string><key>ProcessType</key><string>Background</string></dict></plist>\n`;
  const prepared = path.join(WORK, 'schedule', `${label}.plist`);
  await writeFile(prepared, plist);
  if (!install) { console.log(`Prepared ${prepared}. Inspect it, then run pnpm directory:schedule --install. Calendar time follows the Mac's timezone; use America/Winnipeg. RunAtLoad performs an overdue check at login.`); return; }
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, plist);
  try { execFileSync('/bin/launchctl', ['bootout', `${domain}/${label}`], { stdio: 'ignore' }); } catch { /* First installation. */ }
  execFileSync('/bin/launchctl', ['bootstrap', domain, file]);
  console.log(`Installed ${file}: Monday 09:00 Mac local time plus overdue check at login. Collection prepares private review batches only.`);
}
