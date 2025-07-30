import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import {
  fieldSupportsMultiple,
  fieldSupportsOptions,
  fieldSupportsSearch,
  getComponentProps,
  getFieldComponent,
} from '@openfaith/ui/form/fieldComponentMapping'
import { Effect } from 'effect'

// Mock components are not needed for these tests since we're testing the mapping functions directly

effect('getFieldComponent - returns correct components for each field type', () =>
  Effect.gen(function* () {
    // Test all field types
    expect(getFieldComponent('text')).toBeDefined()
    expect(getFieldComponent('email')).toBeDefined()
    expect(getFieldComponent('password')).toBeDefined()
    expect(getFieldComponent('number')).toBeDefined()
    expect(getFieldComponent('textarea')).toBeDefined()
    expect(getFieldComponent('select')).toBeDefined()
    expect(getFieldComponent('combobox')).toBeDefined()
    expect(getFieldComponent('singleCombobox')).toBeDefined()
    expect(getFieldComponent('tags')).toBeDefined()
    expect(getFieldComponent('switch')).toBeDefined()
    expect(getFieldComponent('date')).toBeDefined()
    expect(getFieldComponent('datetime')).toBeDefined()
    expect(getFieldComponent('otp')).toBeDefined()
    expect(getFieldComponent('slug')).toBeDefined()
  }),
)

effect('getFieldComponent - returns InputField for undefined field type', () =>
  Effect.gen(function* () {
    const component = getFieldComponent(undefined)
    expect(component).toBeDefined()
  }),
)

effect('getFieldComponent - returns InputField for unknown field type', () =>
  Effect.gen(function* () {
    const component = getFieldComponent('unknown' as any)
    expect(component).toBeDefined()
  }),
)

effect('getComponentProps - returns base props for all field types', () =>
  Effect.gen(function* () {
    const baseConfig = {
      creatable: false,
      hidden: false,
      label: 'Test Field',
      max: 100,
      min: 0,
      multiple: false,
      options: [],
      placeholder: 'Enter value',
      required: true,
      rows: 3,
      searchable: false,
      step: 1,
      type: 'text' as const,
    }

    const props = getComponentProps(baseConfig)

    expect((props as any).label).toBe('Test Field')
    expect((props as any).placeholder).toBe('Enter value')
    expect((props as any).required).toBe(true)
  }),
)

effect('getComponentProps - textarea specific props', () =>
  Effect.gen(function* () {
    const textareaConfig = {
      creatable: false,
      hidden: false,
      label: 'Description',
      max: 100,
      min: 0,
      multiple: false,
      options: [],
      placeholder: 'Enter description',
      required: false,
      rows: 5,
      searchable: false,
      step: 1,
      type: 'textarea' as const,
    }

    const props = getComponentProps(textareaConfig)

    expect((props as any).rows).toBe(5)
    expect((props as any).label).toBe('Description')
  }),
)

effect('getComponentProps - number specific props', () =>
  Effect.gen(function* () {
    const numberConfig = {
      creatable: false,
      hidden: false,
      label: 'Age',
      max: 120,
      min: 0,
      multiple: false,
      options: [],
      placeholder: 'Enter age',
      required: true,
      rows: 3,
      searchable: false,
      step: 1,
      type: 'number' as const,
    }

    const props = getComponentProps(numberConfig)

    expect((props as any).type).toBe('number')
    expect((props as any).min).toBe(0)
    expect((props as any).max).toBe(120)
    expect((props as any).step).toBe(1)
  }),
)

effect('getComponentProps - select specific props', () =>
  Effect.gen(function* () {
    const selectConfig = {
      creatable: false,
      hidden: false,
      label: 'Status',
      max: 100,
      min: 0,
      multiple: true,
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ],
      placeholder: 'Select status',
      required: true,
      rows: 3,
      searchable: true,
      step: 1,
      type: 'select' as const,
    }

    const props = getComponentProps(selectConfig)

    expect((props as any).multiple).toBe(true)
    expect((props as any).options).toHaveLength(2)
    expect((props as any).searchable).toBe(true)
  }),
)

effect('getComponentProps - combobox specific props', () =>
  Effect.gen(function* () {
    const comboboxConfig = {
      creatable: false,
      hidden: false,
      label: 'Categories',
      max: 100,
      min: 0,
      multiple: true,
      options: [
        { label: 'Category 1', value: 'cat1' },
        { label: 'Category 2', value: 'cat2' },
      ],
      placeholder: 'Select categories',
      required: false,
      rows: 3,
      searchable: true,
      step: 1,
      type: 'combobox' as const,
    }

    const props = getComponentProps(comboboxConfig)

    expect((props as any).multiple).toBe(true)
    expect((props as any).options).toHaveLength(2)
    expect((props as any).searchable).toBe(true)
  }),
)

effect('getComponentProps - singleCombobox specific props', () =>
  Effect.gen(function* () {
    const singleComboboxConfig = {
      creatable: false,
      hidden: false,
      label: 'Category',
      max: 100,
      min: 0,
      multiple: false,
      options: [
        { label: 'Category 1', value: 'cat1' },
        { label: 'Category 2', value: 'cat2' },
      ],
      placeholder: 'Select category',
      required: true,
      rows: 3,
      searchable: true,
      step: 1,
      type: 'singleCombobox' as const,
    }

    const props = getComponentProps(singleComboboxConfig)

    expect((props as any).multiple).toBe(false)
    expect((props as any).options).toHaveLength(2)
    expect((props as any).searchable).toBe(true)
  }),
)

effect('getComponentProps - tags specific props', () =>
  Effect.gen(function* () {
    const tagsConfig = {
      creatable: true,
      hidden: false,
      label: 'Tags',
      max: 100,
      min: 0,
      multiple: false,
      options: [
        { label: 'Tag 1', value: 'tag1' },
        { label: 'Tag 2', value: 'tag2' },
      ],
      placeholder: 'Add tags',
      required: false,
      rows: 3,
      searchable: false,
      step: 1,
      type: 'tags' as const,
    }

    const props = getComponentProps(tagsConfig)

    expect((props as any).creatable).toBe(true)
    expect((props as any).options).toHaveLength(2)
  }),
)

effect('getComponentProps - email specific props', () =>
  Effect.gen(function* () {
    const emailConfig = {
      creatable: false,
      hidden: false,
      label: 'Email',
      max: 100,
      min: 0,
      multiple: false,
      options: [],
      placeholder: 'Enter email',
      required: true,
      rows: 3,
      searchable: false,
      step: 1,
      type: 'email' as const,
    }

    const props = getComponentProps(emailConfig)

    expect((props as any).type).toBe('email')
  }),
)

effect('getComponentProps - password specific props', () =>
  Effect.gen(function* () {
    const passwordConfig = {
      creatable: false,
      hidden: false,
      label: 'Password',
      max: 100,
      min: 0,
      multiple: false,
      options: [],
      placeholder: 'Enter password',
      required: true,
      rows: 3,
      searchable: false,
      step: 1,
      type: 'password' as const,
    }

    const props = getComponentProps(passwordConfig)

    expect((props as any).type).toBe('password')
  }),
)

effect('getComponentProps - date specific props', () =>
  Effect.gen(function* () {
    const dateConfig = {
      creatable: false,
      hidden: false,
      label: 'Birth Date',
      max: 100,
      min: 0,
      multiple: false,
      options: [],
      placeholder: 'Select date',
      required: true,
      rows: 3,
      searchable: false,
      step: 1,
      type: 'date' as const,
    }

    const props = getComponentProps(dateConfig)

    expect((props as any).label).toBe('Birth Date')
    expect((props as any).placeholder).toBe('Select date')
  }),
)

effect('getComponentProps - datetime specific props', () =>
  Effect.gen(function* () {
    const datetimeConfig = {
      creatable: false,
      hidden: false,
      label: 'Event Time',
      max: 100,
      min: 0,
      multiple: false,
      options: [],
      placeholder: 'Select date and time',
      required: true,
      rows: 3,
      searchable: false,
      step: 1,
      type: 'datetime' as const,
    }

    const props = getComponentProps(datetimeConfig)

    expect((props as any).label).toBe('Event Time')
    expect((props as any).placeholder).toBe('Select date and time')
  }),
)

effect('getComponentProps - switch specific props', () =>
  Effect.gen(function* () {
    const switchConfig = {
      creatable: false,
      hidden: false,
      label: 'Is Active',
      max: 100,
      min: 0,
      multiple: false,
      options: [],
      placeholder: '',
      required: false,
      rows: 3,
      searchable: false,
      step: 1,
      type: 'switch' as const,
    }

    const props = getComponentProps(switchConfig)

    expect((props as any).label).toBe('Is Active')
  }),
)

effect('getComponentProps - otp specific props', () =>
  Effect.gen(function* () {
    const otpConfig = {
      creatable: false,
      hidden: false,
      label: 'Verification Code',
      max: 100,
      min: 0,
      multiple: false,
      options: [],
      placeholder: 'Enter code',
      required: true,
      rows: 3,
      searchable: false,
      step: 1,
      type: 'otp' as const,
    }

    const props = getComponentProps(otpConfig)

    expect((props as any).label).toBe('Verification Code')
    expect((props as any).placeholder).toBe('Enter code')
  }),
)

effect('getComponentProps - slug specific props', () =>
  Effect.gen(function* () {
    const slugConfig = {
      creatable: false,
      hidden: false,
      label: 'URL Slug',
      max: 100,
      min: 0,
      multiple: false,
      options: [],
      placeholder: 'Enter slug',
      required: true,
      rows: 3,
      searchable: false,
      step: 1,
      type: 'slug' as const,
    }

    const props = getComponentProps(slugConfig)

    expect((props as any).label).toBe('URL Slug')
    expect((props as any).placeholder).toBe('Enter slug')
  }),
)

effect('getComponentProps - default case returns base props', () =>
  Effect.gen(function* () {
    const unknownConfig = {
      creatable: false,
      hidden: false,
      label: 'Unknown Field',
      max: 100,
      min: 0,
      multiple: false,
      options: [],
      placeholder: 'Enter value',
      required: true,
      rows: 3,
      searchable: false,
      step: 1,
      type: 'unknown' as any,
    }

    const props = getComponentProps(unknownConfig)

    expect((props as any).label).toBe('Unknown Field')
    expect((props as any).placeholder).toBe('Enter value')
    expect((props as any).required).toBe(true)
    // Should not have type-specific props
    expect((props as any).type).toBeUndefined()
    expect((props as any).rows).toBeUndefined()
    expect((props as any).min).toBeUndefined()
  }),
)

effect('fieldSupportsOptions - returns true for option-based field types', () =>
  Effect.gen(function* () {
    expect(fieldSupportsOptions('select')).toBe(true)
    expect(fieldSupportsOptions('combobox')).toBe(true)
    expect(fieldSupportsOptions('singleCombobox')).toBe(true)
    expect(fieldSupportsOptions('tags')).toBe(true)
  }),
)

effect('fieldSupportsOptions - returns false for non-option field types', () =>
  Effect.gen(function* () {
    expect(fieldSupportsOptions('text')).toBe(false)
    expect(fieldSupportsOptions('email')).toBe(false)
    expect(fieldSupportsOptions('password')).toBe(false)
    expect(fieldSupportsOptions('number')).toBe(false)
    expect(fieldSupportsOptions('textarea')).toBe(false)
    expect(fieldSupportsOptions('switch')).toBe(false)
    expect(fieldSupportsOptions('date')).toBe(false)
    expect(fieldSupportsOptions('datetime')).toBe(false)
    expect(fieldSupportsOptions('otp')).toBe(false)
    expect(fieldSupportsOptions('slug')).toBe(false)
    expect(fieldSupportsOptions(undefined)).toBe(false)
  }),
)

effect('fieldSupportsMultiple - returns true for multiple-value field types', () =>
  Effect.gen(function* () {
    expect(fieldSupportsMultiple('combobox')).toBe(true)
    expect(fieldSupportsMultiple('tags')).toBe(true)
  }),
)

effect('fieldSupportsMultiple - returns false for single-value field types', () =>
  Effect.gen(function* () {
    expect(fieldSupportsMultiple('text')).toBe(false)
    expect(fieldSupportsMultiple('email')).toBe(false)
    expect(fieldSupportsMultiple('password')).toBe(false)
    expect(fieldSupportsMultiple('number')).toBe(false)
    expect(fieldSupportsMultiple('textarea')).toBe(false)
    expect(fieldSupportsMultiple('select')).toBe(false)
    expect(fieldSupportsMultiple('singleCombobox')).toBe(false)
    expect(fieldSupportsMultiple('switch')).toBe(false)
    expect(fieldSupportsMultiple('date')).toBe(false)
    expect(fieldSupportsMultiple('datetime')).toBe(false)
    expect(fieldSupportsMultiple('otp')).toBe(false)
    expect(fieldSupportsMultiple('slug')).toBe(false)
    expect(fieldSupportsMultiple(undefined)).toBe(false)
  }),
)

effect('fieldSupportsSearch - returns true for searchable field types', () =>
  Effect.gen(function* () {
    expect(fieldSupportsSearch('combobox')).toBe(true)
    expect(fieldSupportsSearch('singleCombobox')).toBe(true)
  }),
)

effect('fieldSupportsSearch - returns false for non-searchable field types', () =>
  Effect.gen(function* () {
    expect(fieldSupportsSearch('text')).toBe(false)
    expect(fieldSupportsSearch('email')).toBe(false)
    expect(fieldSupportsSearch('password')).toBe(false)
    expect(fieldSupportsSearch('number')).toBe(false)
    expect(fieldSupportsSearch('textarea')).toBe(false)
    expect(fieldSupportsSearch('select')).toBe(false)
    expect(fieldSupportsSearch('tags')).toBe(false)
    expect(fieldSupportsSearch('switch')).toBe(false)
    expect(fieldSupportsSearch('date')).toBe(false)
    expect(fieldSupportsSearch('datetime')).toBe(false)
    expect(fieldSupportsSearch('otp')).toBe(false)
    expect(fieldSupportsSearch('slug')).toBe(false)
    expect(fieldSupportsSearch(undefined)).toBe(false)
  }),
)
