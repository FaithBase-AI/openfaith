import { getIdType } from '@openfaith/shared'
import type { OrgClientShape, UserClientShape } from '@openfaith/zero'

export type RecordDisplayData = {
  id: string
  name: string | null
  avatar?: string | null
}

export type UserTagRecord = Pick<UserClientShape, '_tag' | 'id' | 'name' | 'image'>
export type OrgTagRecord = Pick<OrgClientShape, '_tag' | 'id' | 'name' | 'logo'>

export type RecordData = UserTagRecord | OrgTagRecord

export const idToRecordsTag = (id: string): RecordData['_tag'] => {
  switch (getIdType(id)) {
    case 'org':
      return 'org'
    // case 'user':
    default:
      return 'user'
  }
}

export const displayEntityType: Record<RecordData['_tag'], string> = {
  user: 'Users',
  org: 'Organizations',
}
