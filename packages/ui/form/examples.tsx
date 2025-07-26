import { OfUiConfig } from '@openfaith/schema/shared/schema'
import { UniversalForm } from '@openfaith/ui/form/UniversalForm'
import { Schema } from 'effect'

// Example schema with UI annotations
export const ExamplePersonSchema = Schema.Struct({
  age: Schema.Number.annotations({
    [OfUiConfig]: {
      field: {
        label: 'Age',
        max: 120,
        min: 0,
      },
    },
  }),

  bio: Schema.String.pipe(Schema.NullOr).annotations({
    [OfUiConfig]: {
      field: {
        label: 'Biography', // Override auto-detection (would be "text")
        placeholder: 'Tell us about yourself...',
        rows: 4,
        type: 'textarea',
        // required: false - AUTO-DETECTED from Schema.NullOr
      },
    },
  }),

  department: Schema.Literal('Engineering', 'Sales', 'Marketing', 'HR').annotations({
    [OfUiConfig]: {
      field: {
        // type: "select" - AUTO-DETECTED from Schema.Literal union
        // options: [...] - AUTO-DETECTED from literal values
        label: 'Department',
        options: [
          { label: 'Engineering', value: 'Engineering' },
          { label: 'Sales', value: 'Sales' },
          { label: 'Marketing', value: 'Marketing' },
          { label: 'Human Resources', value: 'HR' },
        ],
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
        // type: "email" - AUTO-DETECTED from email pattern
        label: 'Email Address',
        placeholder: 'Enter email address',
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
    },
  }),

  isActive: Schema.Boolean.annotations({
    [OfUiConfig]: {
      field: {
        // type: "switch" - AUTO-DETECTED from Schema.Boolean
        label: 'Active',
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
    },
  }),
})

export type ExamplePerson = typeof ExamplePersonSchema.Type

// Example 1: Fully Automatic Form
export const AutomaticPersonForm = () => (
  <UniversalForm
    className='mx-auto max-w-2xl p-6'
    onSubmit={(person) => {
      console.log('Submitted person:', person)
      // Handle form submission
    }}
    schema={ExamplePersonSchema}
  />
)

// Example 2: Form with Field Overrides
export const PersonFormWithOverrides = () => (
  <UniversalForm
    className='mx-auto max-w-2xl p-6'
    fieldOverrides={{
      bio: {
        placeholder: 'Tell us more about this person...',
        rows: 6,
      },
      department: {
        searchable: true,
      },
    }}
    onSubmit={(person) => {
      console.log('Submitted person:', person)
    }}
    schema={ExamplePersonSchema}
  />
)

// Example 3: Custom Layout with Field Access
export const CustomPersonForm = () => (
  <UniversalForm
    fieldOverrides={{
      bio: { rows: 6 },
      department: { searchable: true },
    }}
    onSubmit={(person) => {
      console.log('Submitted person:', person)
    }}
    schema={ExamplePersonSchema}
  >
    {(form, fields) => (
      <form
        className='mx-auto max-w-4xl p-6'
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <div className='grid grid-cols-2 gap-4'>
          <form.Field
            name='firstName'
            validators={{
              onChange: (value: any) =>
                !value ? `${fields.firstName?.label || 'First Name'} is required` : undefined,
            }}
          >
            {(field: any) => (
              <div>
                <label className='mb-1 block font-medium text-sm' htmlFor='firstName'>
                  {fields.firstName?.label || 'First Name'}
                </label>
                <input
                  className='w-full rounded border px-3 py-2'
                  id='firstName'
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={fields.firstName?.placeholder || ''}
                  value={field.state.value || ''}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className='mt-1 text-red-500 text-sm'>{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name='lastName'
            validators={{
              onChange: (value: any) =>
                !value ? `${fields.lastName?.label || 'Last Name'} is required` : undefined,
            }}
          >
            {(field: any) => (
              <div>
                <label className='mb-1 block font-medium text-sm' htmlFor='lastName'>
                  {fields.lastName?.label || 'Last Name'}
                </label>
                <input
                  className='w-full rounded border px-3 py-2'
                  id='lastName'
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={fields.lastName?.placeholder || ''}
                  value={field.state.value || ''}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className='mt-1 text-red-500 text-sm'>{field.state.meta.errors.join(', ')}</p>
                )}
              </div>
            )}
          </form.Field>
        </div>

        <div className='mt-4'>
          <form.Field
            name='bio'
            validators={{
              onChange: () => undefined, // Optional field
            }}
          >
            {(field: any) => (
              <div>
                <label className='mb-1 block font-medium text-sm' htmlFor='bio'>
                  {fields.bio?.label || 'Biography'}
                </label>
                <textarea
                  className='w-full rounded border px-3 py-2'
                  id='bio'
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder={fields.bio?.placeholder || ''}
                  rows={fields.bio?.rows || 3}
                  value={field.state.value || ''}
                />
              </div>
            )}
          </form.Field>
        </div>

        <button
          className='mt-6 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600'
          type='submit'
        >
          Create Person
        </button>
      </form>
    )}
  </UniversalForm>
)
