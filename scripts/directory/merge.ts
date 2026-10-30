import type { Professor } from '../../src/lib/directory/types';
import { expired, normalize } from '../../src/lib/directory/model';

export function stableId(universityId: string, name: string): string {
  return `${universityId}-${normalize(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}
export function mergeProfessor(previous: Professor | undefined, candidate: Professor, successfulUrls: Set<string>): Professor {
  if (previous && (previous.id !== candidate.id || previous.universityId !== candidate.universityId || previous.department !== candidate.department || normalize(previous.name) !== normalize(candidate.name))) throw new Error(`Refusing identity reassignment: ${candidate.id}`);
  const next = structuredClone(candidate);
  next.portrait = previous?.portrait ?? null;
  if (previous) {
    const missing = previous.recruitment.filter(c => !successfulUrls.has(c.evidence.url) || expired(c));
    for (const c of missing) if (!next.recruitment.some(n => n.status === c.status && n.degree === c.degree && n.intake === c.intake && n.evidence.url === c.evidence.url && n.evidence.quote === c.evidence.quote)) next.recruitment.push(c);
    for (const c of previous.funding.filter(c => !successfulUrls.has(c.evidence.url))) if (!next.funding.some(n => n.status === c.status && n.degree === c.degree && n.evidence.url === c.evidence.url && n.evidence.quote === c.evidence.quote)) next.funding.push(c);
    next.links = [...previous.links, ...next.links.filter(link => !previous.links.some(old => old.url === link.url))];
  }
  for (const a of next.recruitment) for (const b of next.recruitment) {
    const overlap = (a.degree === b.degree || a.degree === 'unspecified' || b.degree === 'unspecified') && (!a.intake || !b.intake || a.intake === b.intake);
    if (a.status === 'opening' && b.status === 'closed' && overlap && !expired(a) && !expired(b)) next.conflicts.push(`Sources disagree about ${a.degree === 'unspecified' ? 'graduate' : a.degree} recruitment${a.intake ? ` for ${a.intake}` : ''}.`);
  }
  next.conflicts = [...new Set(next.conflicts)];
  return next;
}
