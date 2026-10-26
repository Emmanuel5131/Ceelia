/**
 * Sample data for the overview and the case bank, until cases are connected to the database. The screens say so on the page.
 * Platform names are placeholders: the real ones stay anonymized until the platform consents to being named.
 * Timestamps are fixed ISO strings, so server and browser always render the same text.
 */
export type CaseStatus = 'collecting' | 'building' | 'sealed' | 'counsel';

export type SampleCase = {
  id: string;
  number: string;
  name: string;
  /** A jurisdiction id from `@celia/jurisdictions`. */
  jurisdiction: string;
  claimants: number;
  status: CaseStatus;
  /** ISO timestamp of the last change. */
  updatedAt: string;
};

export const sampleCases: SampleCase[] = [
  {
    id: 'c-142',
    number: 'CB-0142',
    name: 'Platform A',
    jurisdiction: 'ng',
    claimants: 142,
    status: 'sealed',
    updatedAt: '2026-10-26T08:41:00Z',
  },
  {
    id: 'c-141',
    number: 'CB-0141',
    name: 'Platform B',
    jurisdiction: 'us',
    claimants: 318,
    status: 'counsel',
    updatedAt: '2026-10-25T09:12:00Z',
  },
  {
    id: 'c-139',
    number: 'CB-0139',
    name: 'Protocol P',
    jurisdiction: 'gb',
    claimants: 57,
    status: 'building',
    updatedAt: '2026-10-24T10:30:00Z',
  },
  {
    id: 'c-138',
    number: 'CB-0138',
    name: 'Platform C',
    jurisdiction: 'in',
    claimants: 204,
    status: 'collecting',
    updatedAt: '2026-10-23T11:05:00Z',
  },
  {
    id: 'c-136',
    number: 'CB-0136',
    name: 'Platform D',
    jurisdiction: 'ke',
    claimants: 89,
    status: 'sealed',
    updatedAt: '2026-10-21T15:20:00Z',
  },
  {
    id: 'c-133',
    number: 'CB-0133',
    name: 'Platform E',
    jurisdiction: 'ng',
    claimants: 61,
    status: 'collecting',
    updatedAt: '2026-10-20T13:44:00Z',
  },
  {
    id: 'c-130',
    number: 'CB-0130',
    name: 'Protocol Q',
    jurisdiction: 'de',
    claimants: 23,
    status: 'building',
    updatedAt: '2026-10-17T09:58:00Z',
  },
  {
    id: 'c-127',
    number: 'CB-0127',
    name: 'Platform F',
    jurisdiction: 'br',
    claimants: 412,
    status: 'counsel',
    updatedAt: '2026-10-14T16:02:00Z',
  },
  {
    id: 'c-125',
    number: 'CB-0125',
    name: 'Platform G',
    jurisdiction: 'za',
    claimants: 36,
    status: 'collecting',
    updatedAt: '2026-10-12T10:15:00Z',
  },
  {
    id: 'c-122',
    number: 'CB-0122',
    name: 'Protocol R',
    jurisdiction: 'sg',
    claimants: 74,
    status: 'building',
    updatedAt: '2026-10-10T08:05:00Z',
  },
  {
    id: 'c-119',
    number: 'CB-0119',
    name: 'Platform H',
    jurisdiction: 'au',
    claimants: 128,
    status: 'sealed',
    updatedAt: '2026-10-08T12:40:00Z',
  },
  {
    id: 'c-117',
    number: 'CB-0117',
    name: 'Platform I',
    jurisdiction: 'ke',
    claimants: 45,
    status: 'counsel',
    updatedAt: '2026-10-05T14:22:00Z',
  },
];

export type ActivityKind = 'claims_added' | 'evidence_sealed' | 'case_taken' | 'method_reviewed';

export type SampleActivity = {
  id: string;
  kind: ActivityKind;
  case: string;
  count?: number;
  hash?: string;
  /** ISO timestamp. */
  at: string;
};

export const sampleActivity: SampleActivity[] = [
  {
    id: 'a1',
    kind: 'evidence_sealed',
    case: 'Platform A',
    hash: '609154d',
    at: '2026-10-26T08:41:00Z',
  },
  { id: 'a2', kind: 'claims_added', case: 'Platform C', count: 14, at: '2026-10-26T03:20:00Z' },
  { id: 'a3', kind: 'case_taken', case: 'Platform B', at: '2026-10-25T09:12:00Z' },
  { id: 'a4', kind: 'method_reviewed', case: 'Protocol P', at: '2026-10-24T10:30:00Z' },
  { id: 'a5', kind: 'claims_added', case: 'Platform E', count: 6, at: '2026-10-23T14:10:00Z' },
  {
    id: 'a6',
    kind: 'evidence_sealed',
    case: 'Platform D',
    hash: '2e9f6ee',
    at: '2026-10-21T15:20:00Z',
  },
];

export const sampleStats = {
  newCases: 12,
  newThisWeek: 3,
  openCases: 4,
  needResponse: 2,
  waitingClaimants: 187,
  acrossCases: 3,
  sealedFiles: 9,
  sealedThisMonth: 2,
};
