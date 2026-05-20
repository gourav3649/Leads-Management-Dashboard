export const LEAD_SOURCES = ['Website', 'Instagram', 'Referral'] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];
