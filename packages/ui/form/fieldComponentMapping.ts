import type { RequiredFieldConfig } from '@openfaith/ui/form/fieldConfigGenerator'

type FieldConfigType = RequiredFieldConfig
type FieldType = FieldConfigType['type']
/**
 * Maps field types to their corresponding component names for TanStack Form
 */
export const getFieldComponentName = (fieldType?: FieldType): string => {
  const componentNameMap = {
    addressLocation: 'AddressLocationField',
    combobox: 'ComboboxField',
    date: 'DatePickerField',
    datetime: 'DateTimeField',
    email: 'InputField',
    number: 'InputField',
    otp: 'OTPField',
    password: 'InputField',
    select: 'SelectField',
    singleCombobox: 'SingleComboboxField',
    slug: 'SlugInputField',
    switch: 'SwitchField',
    tags: 'TagInputField',
    text: 'InputField',
    textarea: 'TextareaField',
  } as const

  if (!fieldType) {
    return 'InputField'
  }

  return componentNameMap[fieldType] || 'InputField'
}

/**
 * Gets component-specific props based on field configuration
 */
export const getComponentProps = (config: FieldConfigType) => {
  const baseProps = {
    label: config.label,
    placeholder: config.placeholder,
    required: config.required,
  }

  const fieldType = config.type

  switch (fieldType) {
    case 'textarea':
      return {
        ...baseProps,
        rows: config.rows,
      }

    case 'number':
      return {
        ...baseProps,
        max: config.max,
        min: config.min,
        step: config.step,
        type: 'number',
      }

    case 'select':
    case 'combobox':
    case 'singleCombobox':
      return {
        ...baseProps,
        multiple: config.multiple,
        options: config.options,
        searchable: config.searchable,
      }

    case 'tags':
      return {
        ...baseProps,
        creatable: config.creatable,
        options: config.options,
      }

    case 'email':
      return {
        ...baseProps,
        type: 'email',
      }

    case 'password':
      return {
        ...baseProps,
        type: 'password',
      }

    case 'date':
    case 'datetime':
      return baseProps

    case 'switch':
      return baseProps

    case 'otp':
      return baseProps

    case 'slug':
      return baseProps

    case 'addressLocation':
      return baseProps

    default:
      return baseProps
  }
}
