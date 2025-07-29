import { OfUiConfig } from '@openfaith/schema/shared/schema'
import { UniversalTable } from '@openfaith/ui/table/UniversalTable'
import { Schema } from 'effect'

// Example schema with table annotations
export const PersonWithTableSchema = Schema.Struct({
  age: Schema.Number.annotations({
    [OfUiConfig]: {
      field: {
        label: 'Age',
        max: 120,
        min: 0,
      },
      table: {
        header: 'Age',
        width: 80,
      },
    },
  }),

  avatar: Schema.String.pipe(Schema.NullOr).annotations({
    [OfUiConfig]: {
      field: {
        label: 'Avatar URL',
        placeholder: 'Enter avatar URL',
      },
      table: {
        cellType: 'avatar',
        filterable: false,
        header: 'Avatar',
        sortable: false,
        width: 80,
      },
    },
  }),

  bio: Schema.String.pipe(Schema.NullOr).annotations({
    [OfUiConfig]: {
      field: {
        label: 'Biography',
        placeholder: 'Tell us about yourself...',
        rows: 4,
        type: 'textarea',
      },
      table: {
        hidden: true, // This field won't appear in tables
      },
    },
  }),

  department: Schema.Literal('Engineering', 'Sales', 'Marketing', 'HR').annotations({
    [OfUiConfig]: {
      field: {
        label: 'Department',
        options: [
          { label: 'Engineering', value: 'Engineering' },
          { label: 'Sales', value: 'Sales' },
          { label: 'Marketing', value: 'Marketing' },
          { label: 'Human Resources', value: 'HR' },
        ],
      },
      table: {
        cellType: 'badge',
        header: 'Department',
        width: 120,
      },
    },
  }),

  email: Schema.String.pipe(
    Schema.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, {
      message: () => 'Invalid email address',
    }),
  ).annotations({
    [OfUiConfig]: {
      field: {
        label: 'Email Address',
        placeholder: 'Enter email address',
      },
      table: {
        header: 'Email',
        width: 200,
      },
    },
  }),
  firstName: Schema.String.annotations({
    description: 'The first name of the person',
    [OfUiConfig]: {
      field: {
        label: 'First Name',
        placeholder: 'Enter first name',
      },
      table: {
        header: 'First Name',
        width: 150,
      },
    },
  }),

  isActive: Schema.Boolean.annotations({
    [OfUiConfig]: {
      field: {
        label: 'Active',
      },
      table: {
        header: 'Status',
        width: 100,
      },
    },
  }),

  lastName: Schema.String.annotations({
    description: 'The last name of the person',
    [OfUiConfig]: {
      field: {
        label: 'Last Name',
        placeholder: 'Enter last name',
      },
      table: {
        header: 'Last Name',
        width: 150,
      },
    },
  }),

  salary: Schema.Number.pipe(Schema.NullOr).annotations({
    [OfUiConfig]: {
      field: {
        label: 'Annual Salary',
        min: 0,
        placeholder: 'Enter salary',
        step: 1000,
      },
      table: {
        cellType: 'currency',
        filterable: false,
        header: 'Salary',
        width: 120,
      },
    },
  }),
})

export type PersonWithTable = typeof PersonWithTableSchema.Type

// Sample data
export const samplePeople: Array<PersonWithTable> = [
  {
    age: 30,
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    bio: 'Software engineer with 5 years of experience.',
    department: 'Engineering',
    email: 'john.doe@example.com',
    firstName: 'John',
    isActive: true,
    lastName: 'Doe',
    salary: 75000,
  },
  {
    age: 28,
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face',
    bio: 'Sales professional focused on client relationships.',
    department: 'Sales',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    isActive: true,
    lastName: 'Smith',
    salary: 68000,
  },
  {
    age: 35,
    avatar: null,
    bio: 'Marketing specialist with creative background.',
    department: 'Marketing',
    email: 'bob.johnson@example.com',
    firstName: 'Bob',
    isActive: false,
    lastName: 'Johnson',
    salary: null,
  },
  {
    age: 32,
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
    bio: 'HR manager with expertise in talent acquisition.',
    department: 'HR',
    email: 'alice.williams@example.com',
    firstName: 'Alice',
    isActive: true,
    lastName: 'Williams',
    salary: 82000,
  },
]

// Example 1: Fully Automatic Table
export const AutomaticPersonTable = () => (
  <UniversalTable
    data={samplePeople}
    onRowClick={(person) => {
      console.log('Clicked person:', person)
    }}
    schema={PersonWithTableSchema}
  />
)

// Example 2: Table with Custom Configuration
export const CustomPersonTable = () => (
  <UniversalTable
    columnOverrides={{
      salary: {
        cell: ({ getValue }) => {
          const value = getValue() as number | null
          return value ? `$${value.toLocaleString()}` : 'N/A'
        },
      },
    }}
    data={samplePeople}
    onRowSelect={(selectedPeople) => {
      console.log('Selected people:', selectedPeople)
    }}
    pagination={{ pageSize: 50 }}
    schema={PersonWithTableSchema}
  />
)

// Example 3: Table with Advanced Features
export const AdvancedPersonTable = () => (
  <UniversalTable
    className='rounded-lg shadow-lg'
    data={samplePeople}
    filtering={{
      filterColumnId: 'name',
      filterKey: 'people-filter',
      filterPlaceHolder: 'Search people...',
    }}
    onRowClick={(person) => {
      console.log('Selected person:', person)
    }}
    onRowSelect={(people) => {
      console.log('Bulk selected people:', people)
    }}
    pagination={{
      limit: 100,
      pageSize: 25,
    }}
    schema={PersonWithTableSchema}
  />
)

// Example 4: Simple Table (minimal configuration)
export const SimplePersonTable = () => (
  <UniversalTable data={samplePeople} schema={PersonWithTableSchema} />
)
