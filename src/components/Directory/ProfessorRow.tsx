import type { Professor } from '../../lib/directory/types';
import { dateLabel, fundingSummary, lastChecked, overdue, profileUrl, recruitmentSummary } from '../../lib/directory/model';
import Portrait from './Portrait';

export default function ProfessorRow({ professor: p, university, today }: { professor: Professor; university: string; today: string }) {
  const now = new Date(today);
  return <li className="border-b border-rule dark:border-rule-dark py-4">
    <article className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-4">
      <Portrait professor={p} />
      <div className="min-w-0">
        <h2 className="font-display text-2xl leading-tight text-ink-900 dark:text-ink-100"><a className="directory-link" href={profileUrl(p.id)}>{p.name}</a></h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-ink-300">{university}{p.department ? `, ${p.department}` : ''}</p>
        <p className="mt-2 text-sm leading-relaxed">{p.interests.length ? p.interests.join(', ') : 'Research interests not yet catalogued.'}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
          <span className="directory-label">{recruitmentSummary(p, now)}</span>
          <span className="directory-label">{fundingSummary(p)}</span>
          <span className="text-ink-500 dark:text-ink-300">Checked {dateLabel(lastChecked(p))}</span>
          {overdue(lastChecked(p), now) && <span className="directory-label">Overdue</span>}
        </div>
      </div>
    </article>
  </li>;
}
