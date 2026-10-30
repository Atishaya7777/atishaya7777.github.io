import type { UniversityData } from './types';

const modules = import.meta.glob<{ default: UniversityData }>('../../data/grad-directory/*.json', { eager: true });
export const universities = Object.values(modules).map(m => m.default).sort((a, b) => a.university.name.localeCompare(b.university.name));
export const universityNames = Object.fromEntries(universities.map(u => [u.university.id, u.university.name]));
export const professors = universities.flatMap(u => u.professors).sort((a, b) => a.sortName.localeCompare(b.sortName, 'en', { sensitivity: 'base' }) || a.id.localeCompare(b.id));
