import { useEffect, useState } from 'react';
import type { DirectoryFilters, Professor } from '../../lib/directory/types';
import { disciplineLabels, degreeLabels, emptyFilters, filtersFromSearch, filtersToSearch, fundingLabels, matchesProfessor, recruitmentLabels } from '../../lib/directory/model';
import DirectoryIcon from './DirectoryIcon';
import ProfessorRow from './ProfessorRow';

interface Props { professors: Professor[]; universities: Record<string, string>; today: string }
export default function DirectorySearch({ professors, universities, today }: Props) {
  const [filters, setFilters] = useState<DirectoryFilters>({ ...emptyFilters });
  const [ready, setReady] = useState(false);
  const [asOf, setAsOf] = useState(today);
  useEffect(() => {
    const restore = () => setFilters(filtersFromSearch(window.location.search));
    restore(); setReady(true); setAsOf(new Date().toISOString());
    const timer = window.setInterval(() => setAsOf(new Date().toISOString()), 3600000);
    window.addEventListener('popstate', restore);
    return () => { window.removeEventListener('popstate', restore); window.clearInterval(timer); };
  }, []);
  const update = (patch: Partial<DirectoryFilters>, replace = false) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    const url = `${window.location.pathname}${filtersToSearch(next)}${window.location.hash}`;
    if (replace) window.history.replaceState(null, '', url); else window.history.pushState(null, '', url);
  };
  const select = (key: keyof DirectoryFilters, label: string, options: Record<string, string>) => (
    <div className="text-sm">
      <label htmlFor={`directory-${key}`}>{label}</label>
      <div className="relative mt-1.5">
        <select id={`directory-${key}`} className="directory-input directory-select" value={filters[key]} onChange={e => update({ [key]: e.target.value })}>
          <option value="">All {label.toLowerCase()}</option>
          {Object.entries(options).map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select>
        <DirectoryIcon name="chevron" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 dark:text-ink-300" />
      </div>
    </div>
  );
  const intakes = Object.fromEntries([...new Set(professors.flatMap(p => p.recruitment.flatMap(c => c.intake ? [c.intake] : [])))].sort().map(i => [i, i]));
  const results = professors.filter(p => matchesProfessor(p, filters, universities[p.universityId], new Date(asOf)));
  const active = Object.values(filters).some(Boolean);
  const countLabel = `${results.length} ${results.length === 1 ? 'professor' : 'professors'}`;
  return <>
    <section aria-label="Find a supervisor" className="mt-6">
      {!ready && <noscript><p className="mb-3 text-sm">All covered professors are listed below. Enable JavaScript to search and filter.</p></noscript>}
      <fieldset disabled={!ready} className="min-w-0">
        <label htmlFor="directory-query" className="sr-only">Search the directory</label>
        <input id="directory-query" type="search" value={filters.q} onChange={e => update({ q: e.target.value }, true)} placeholder="Name, university, or research interest…" className="directory-input text-base" />
        <div className="mt-3 grid sm:grid-cols-3 gap-3">
          {select('university', 'Universities', universities)}
          {select('discipline', 'Disciplines', disciplineLabels)}
          {select('degree', 'Degrees', { masters: degreeLabels.masters, phd: degreeLabels.phd })}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="flex gap-2.5 items-center text-sm"><input className="accent-[#5C2E60] h-4 w-4" type="checkbox" checked={filters.recruitment === 'opening'} onChange={e => update({ recruitment: e.target.checked ? 'opening' : '' })} />Advertised openings only</label>
          {active && <button className="directory-link text-sm" type="button" onClick={() => update(emptyFilters)}>Clear filters</button>}
        </div>
        <details className="directory-more mt-3" open={Boolean(filters.funding || filters.intake || (filters.recruitment && filters.recruitment !== 'opening')) || undefined}>
          <summary className="directory-link flex w-fit cursor-pointer items-center gap-1.5 text-sm">
            <DirectoryIcon name="chevron" className="directory-more-chevron" />
            More filters
          </summary>
          <div className="mt-3 grid sm:grid-cols-3 gap-3">
            {select('recruitment', 'Recruitment statuses', recruitmentLabels)}
            {select('funding', 'Funding types', fundingLabels)}
            {select('intake', 'Advertised intakes', intakes)}
          </div>
        </details>
      </fieldset>
    </section>
    <div className="mt-6 border-t border-rule dark:border-rule-dark pt-3">
      <p role="status" aria-live="polite" className="text-sm text-ink-500 dark:text-ink-300">{countLabel}</p>
    </div>
    {results.length ? <ol className="list-none">{results.map(p => <ProfessorRow key={p.id} professor={p} university={universities[p.universityId]} today={asOf} />)}</ol> : <div className="py-12 text-center"><h2 className="font-display text-2xl text-ink-900 dark:text-ink-100">No matching records yet</h2><p className="mt-3 text-sm">Try fewer filters or a broader research term.</p><button type="button" className="directory-link mt-4 inline-flex items-center gap-1.5 text-sm" onClick={() => update(emptyFilters)}>Show all covered professors <DirectoryIcon name="arrow-right" /></button></div>}
  </>;
}
