export const OrgRole = {
  Admin: 'admin',
  Member: 'member',
  Owner: 'owner',
} as const

export type OrgRole = (typeof OrgRole)[keyof typeof OrgRole]

export const displayOrgRole: Record<OrgRole, string> = {
  [OrgRole.Owner]: 'Owner',
  [OrgRole.Admin]: 'Admin',
  [OrgRole.Member]: 'Member',
}
