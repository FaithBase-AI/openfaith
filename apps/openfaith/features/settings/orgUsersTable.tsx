'use client'

import { useOrgUsers } from '@openfaith/openfaith/data/orgs/orgData.app'
import { displayOrgRole } from '@openfaith/openfaith/data/orgs/orgsShared'
import { InviteMemberButton } from '@openfaith/openfaith/features/settings/inviteMemberButton'
import { Button } from '@openfaith/ui'
import { Array, pipe } from 'effect'
import type { FC } from 'react'

export const OrgUsersTable: FC = () => {
  const { orgUsersCollection, loading } = useOrgUsers()

  if (loading) {
    return (
      <div className='p-4'>
        <p className='text-muted-foreground'>Loading team members...</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-semibold text-lg'>Team Members</h3>
        <InviteMemberButton size='sm' variant='secondary' />
      </div>

      <div className='rounded-lg border'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b bg-muted/50'>
                <th className='px-4 py-3 text-left font-medium text-sm'>User ID</th>
                <th className='px-4 py-3 text-left font-medium text-sm'>Role</th>
                <th className='px-4 py-3 text-left font-medium text-sm'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pipe(
                orgUsersCollection,
                Array.map((orgUser) => (
                  <tr className='border-b last:border-b-0' key={orgUser.id}>
                    <td className='px-4 py-3'>
                      <div className='font-medium'>{orgUser.userId}</div>
                    </td>
                    <td className='px-4 py-3'>
                      <span className='inline-flex items-center rounded-full bg-blue-50 px-2 py-1 font-medium text-blue-700 text-xs'>
                        {displayOrgRole[orgUser.role as keyof typeof displayOrgRole] ||
                          orgUser.role}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <Button disabled size='sm' variant='ghost'>
                        Manage
                      </Button>
                    </td>
                  </tr>
                )),
              )}
              {orgUsersCollection.length === 0 && (
                <tr>
                  <td className='px-4 py-8 text-center text-muted-foreground' colSpan={3}>
                    No team members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
