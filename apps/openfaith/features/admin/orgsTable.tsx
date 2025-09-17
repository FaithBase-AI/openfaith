'use client'

import {
  orgsFiltersDef,
  orgsTableColumns,
  useAdminOrgsCollection,
} from '@openfaith/openfaith/data/orgs/orgsData.app'
import { type Card, Collection } from '@openfaith/ui'
import type { OrgClientShape } from '@openfaith/zero'
import type { FC } from 'react'

export const OrgsTable: FC = () => {
  const { result: orgsCollection, nextPage, pageSize, limit } = useAdminOrgsCollection()

  return (
    <Collection<OrgClientShape, typeof Card>
      _tag={'orgs'}
      columnsDef={orgsTableColumns}
      data={orgsCollection}
      filterColumnId={'name'}
      filterKey={'admin-orgs'}
      filterPlaceHolder={'Filter Orgs'}
      filtersDef={orgsFiltersDef}
      limit={limit}
      nextPage={nextPage}
      pageSize={pageSize}
    />
  )
}
