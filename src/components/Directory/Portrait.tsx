import { useState } from 'react';
import { initials } from '../../lib/directory/model';
import type { Professor } from '../../lib/directory/types';

export default function Portrait({ professor, large = false }: { professor: Professor; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const classes = `${large ? 'h-32 w-32' : 'h-[88px] w-[88px]'} shrink-0 border border-rule-strong dark:border-rule-dark-strong bg-paper-200 dark:bg-paper-800 flex items-center justify-center`;
  return professor.portrait && !failed ? <img src={professor.portrait.path} width={large ? 128 : 88} height={large ? 128 : 88} alt={`Portrait of ${professor.name}`} loading="lazy" className={`${classes} object-contain`} onError={() => setFailed(true)} /> : <span className={`${classes} font-display text-3xl text-ink-500 dark:text-ink-300`} aria-label={`No approved portrait for ${professor.name}`}>{initials(professor.name)}</span>;
}
