import { discoverEntityNavigation } from '@openfaith/openfaith/components/navigation/schemaNavigation'
import { pluralize } from '@openfaith/shared'
import {
  type Card,
  Collection,
  ColumnHeader,
  getCreatedAtColumn,
  getIdColumn,
  getNameColumn,
} from '@openfaith/ui'
import { createFileRoute } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import { Array, Option, pipe } from 'effect'
import { useMemo } from 'react'

export const Route = createFileRoute('/_app/$group/$entity/')({
  component: RouteComponent,
})

// Mock data for demonstration - in real implementation, this would come from Zero queries
const mockPersonData = [
  {
    createdAt: Date.now() - 86400000 * 30, // 30 days ago
    email: 'john.doe@example.com',
    firstName: 'John',
    id: 'person_01',
    lastName: 'Doe',
    name: 'John Doe',
  },
  {
    createdAt: Date.now() - 86400000 * 15, // 15 days ago
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    id: 'person_02',
    lastName: 'Smith',
    name: 'Jane Smith',
  },
  {
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    email: 'bob.johnson@example.com',
    firstName: 'Bob',
    id: 'person_03',
    lastName: 'Johnson',
    name: 'Bob Johnson',
  },
]

const mockFolderData = [
  {
    createdAt: Date.now() - 86400000 * 20, // 20 days ago
    description: 'Documents for ministry activities',
    id: 'folder_01',
    name: 'Ministry Documents',
  },
  {
    createdAt: Date.now() - 86400000 * 10, // 10 days ago
    description: 'Resources for event planning',
    id: 'folder_02',
    name: 'Event Planning',
  },
]

// Column definitions for different entity types
const personColumns: Array<ColumnDef<(typeof mockPersonData)[0]>> = [
  getIdColumn(),
  getNameColumn(),
  {
    accessorKey: 'firstName',
    header: ({ column }) => <ColumnHeader column={column}>First Name</ColumnHeader>,
    id: 'firstName',
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => <ColumnHeader column={column}>Last Name</ColumnHeader>,
    id: 'lastName',
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <ColumnHeader column={column}>Email</ColumnHeader>,
    id: 'email',
  },
  getCreatedAtColumn(),
]

const folderColumns: Array<ColumnDef<(typeof mockFolderData)[0]>> = [
  getIdColumn(),
  getNameColumn(),
  {
    accessorKey: 'description',
    header: ({ column }) => <ColumnHeader column={column}>Description</ColumnHeader>,
    id: 'description',
  },
  getCreatedAtColumn(),
]

function RouteComponent() {
  const { group, entity } = Route.useParams()

  // Discover entity configuration from schemas
  const entityConfig = useMemo(() => {
    const entities = discoverEntityNavigation()
    return pipe(
      entities,
      Array.findFirst((e) => {
        const entityPlural = pluralize(e.tag.toLowerCase())
        return e.navConfig.module === group && entityPlural === entity
      }),
    )
  }, [group, entity])

  // Get data and columns based on entity type
  const { data, columns } = useMemo(() => {
    return pipe(
      entityConfig,
      Option.match({
        onNone: () => ({ columns: [], data: [] }),
        onSome: (config) => {
          if (config.tag === 'person') {
            return {
              columns: personColumns,
              data: mockPersonData,
            }
          }
          if (config.tag === 'folder') {
            return {
              columns: folderColumns,
              data: mockFolderData,
            }
          }
          return { columns: [], data: [] }
        },
      }),
    )
  }, [entityConfig])

  return pipe(
    entityConfig,
    Option.match({
      onNone: () => (
        <div>
          <h2>Entity Not Found</h2>
          <p>
            Could not find configuration for {entity} in {group}
          </p>
        </div>
      ),
      onSome: (config) => (
        <div className='space-y-4'>
          <div>
            <h1 className='font-bold text-2xl'>{config.navItem.title}</h1>
            <p className='text-gray-600'>{config.navConfig.description}</p>
          </div>

          <Collection<any, typeof Card>
            _tag={`${group}-${entity}` as any}
            Actions={null}
            columnsDef={columns}
            data={data}
            filterColumnId='name'
            filterKey={`${group}-${entity}-filter`}
            filterPlaceHolder={`Search ${String(config.navItem.title).toLowerCase()}...`}
            filtersDef={[]}
            limit={100}
            nextPage={() => {
              // TODO: Implement pagination with Zero queries
              console.log('Next page requested')
            }}
            pageSize={20}
          />
        </div>
      ),
    }),
  )
}
