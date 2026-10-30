import type { DirectoryFilters, Professor, RecruitmentClaim } from './types';

export const disciplineLabels = { cs: 'Computer science', math: 'Mathematics' };
export const degreeLabels = { masters: 'Master’s', phd: 'PhD', unspecified: 'Degree not specified' };
export const recruitmentLabels = { opening: 'Advertised opening', invitation: 'General invitation', closed: 'Explicitly closed', unknown: 'Availability unknown' };
export const fundingLabels = { position: 'Position funding advertised', program: 'Program funding policy', external: 'External funding required', unspecified: 'Funding not stated' };
export const emptyFilters: DirectoryFilters = { q: '', university: '', discipline: '', degree: '', recruitment: '', funding: '', intake: '' };
export const normalize = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).map(part => part[0]).filter((_, i, all) => i === 0 || i === all.length - 1).join('');
export const profileUrl = (id: string) => `/grad-directory/${id}`;
export const dateLabel = (date: string) => new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'America/Winnipeg' }).format(new Date(date));
export const overdue = (checkedAt: string, now = new Date()) => now.valueOf() - new Date(checkedAt).valueOf() > 90 * 86400000;
export function expired(claim: RecruitmentClaim, now = new Date()): boolean {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Winnipeg', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  if (claim.validUntil && claim.validUntil < today) return true;
  const year = claim.intake?.match(/\b(20\d{2})\b/)?.[1];
  if (!year) return false;
  if (Number(year) < Number(today.slice(0, 4))) return true;
  const month = /winter|january|janvier|hiver/i.test(claim.intake!) ? 1 : /spring|summer|may|mai|été|ete|printemps/i.test(claim.intake!) ? 5 : /fall|autumn|september|septembre|automne/i.test(claim.intake!) ? 9 : null;
  return Number(year) === Number(today.slice(0, 4)) && month !== null && Number(today.slice(5, 7)) > month;
}
export const currentOpening = (claim: RecruitmentClaim, now = new Date()) => claim.status === 'opening' && !expired(claim, now) && !overdue(claim.evidence.checkedAt, now);
export function recruitmentSummary(professor: Professor, now = new Date()): string {
  if (professor.conflicts.length) return 'Conflicting statements · see sources';
  if (professor.recruitment.some(c => currentOpening(c, now))) return recruitmentLabels.opening;
  if (professor.recruitment.some(c => c.status === 'opening')) return 'Previous opening · check sources';
  if (professor.recruitment.some(c => c.status === 'invitation')) return recruitmentLabels.invitation;
  if (professor.recruitment.some(c => c.status === 'closed')) return recruitmentLabels.closed;
  return recruitmentLabels.unknown;
}
export function fundingSummary(professor: Professor): string {
  const statuses = [...new Set(professor.funding.map(c => c.status))];
  return statuses.length ? statuses.map(s => fundingLabels[s]).join(' · ') : fundingLabels.unspecified;
}
export function lastChecked(professor: Professor): string {
  return [professor.identityEvidence, ...professor.recruitment.map(c => c.evidence), ...professor.funding.map(c => c.evidence)].map(e => e.checkedAt).sort().at(-1)!;
}
export function matchesProfessor(p: Professor, f: DirectoryFilters, universityName: string, now = new Date()): boolean {
  const haystack = normalize([p.name, universityName, p.department, ...p.interests].join(' '));
  if (normalize(f.q).split(/\s+/).some(word => !haystack.includes(word))) return false;
  if (f.university && f.university !== p.universityId) return false;
  if (f.discipline && !p.disciplines.includes(f.discipline as 'cs' | 'math')) return false;
  const scoped = p.recruitment.filter(c => (!f.degree || c.degree === f.degree) && (!f.intake || c.intake === f.intake));
  if ((f.degree || f.intake) && !scoped.length) return false;
  if (f.recruitment === 'opening' && (p.conflicts.length || !scoped.some(c => currentOpening(c, now)))) return false;
  if (f.recruitment && f.recruitment !== 'opening') {
    if (f.recruitment === 'unknown') {
      if (scoped.length && !scoped.some(c => c.status === 'unknown')) return false;
    } else if (!scoped.some(c => c.status === f.recruitment)) return false;
  }
  if (f.funding) {
    const funded = p.funding.filter(c => (!f.degree || c.degree === f.degree) && (!f.intake || c.intake === f.intake));
    if (f.funding === 'unspecified' ? funded.some(c => c.status !== 'unspecified') : !funded.some(c => c.status === f.funding && !overdue(c.evidence.checkedAt, now))) return false;
  }
  return true;
}
export function filtersFromSearch(search: string): DirectoryFilters {
  const params = new URLSearchParams(search);
  return Object.fromEntries(Object.keys(emptyFilters).map(key => [key, params.get(key) || ''])) as unknown as DirectoryFilters;
}
export function filtersToSearch(filters: DirectoryFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  return params.size ? `?${params.toString()}` : '';
}
