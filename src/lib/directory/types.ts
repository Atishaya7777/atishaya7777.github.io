export type Discipline = 'cs' | 'math';
export type Degree = 'masters' | 'phd' | 'unspecified';
export type RecruitmentStatus = 'opening' | 'invitation' | 'closed' | 'unknown';
export type FundingStatus = 'position' | 'program' | 'external' | 'unspecified';

export interface Evidence {
  url: string;
  quote: string;
  checkedAt: string;
  sourceDate: string | null;
}
export interface RecruitmentClaim {
  status: RecruitmentStatus;
  degree: Degree;
  intake: string | null;
  validUntil: string | null;
  summary: string;
  evidence: Evidence;
}
export interface FundingClaim {
  status: FundingStatus;
  degree: Degree;
  intake: string | null;
  summary: string;
  evidence: Evidence;
}
export interface Professor {
  id: string;
  name: string;
  sortName: string;
  universityId: string;
  department: string;
  disciplines: Discipline[];
  interests: string[];
  links: { kind: 'university' | 'personal' | 'lab'; url: string; label: string }[];
  identityEvidence: Evidence;
  recruitment: RecruitmentClaim[];
  funding: FundingClaim[];
  applicationInstructions: string | null;
  conflicts: string[];
  portrait: { path: string; sha256: string } | null;
}
export interface UniversityData {
  schemaVersion: 1;
  university: { id: string; name: string; province: string };
  coverage: string;
  professors: Professor[];
}
export interface PortraitApproval {
  professorId: string;
  universityId: string;
  name: string;
  department: string;
  sourcePage: string;
  imageUrl: string;
  sha256: string;
  path: string;
  reviewer: string;
  approvedAt: string;
}
export interface DirectoryFilters {
  q: string;
  university: string;
  discipline: string;
  degree: string;
  recruitment: string;
  funding: string;
  intake: string;
}
