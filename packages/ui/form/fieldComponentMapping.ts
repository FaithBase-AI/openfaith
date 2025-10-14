import { AddressLocationField } from '@openfaith/ui/components/form/addressLocationField'
import { ComboboxField } from '@openfaith/ui/components/form/comboboxField'
import { DatePickerField } from '@openfaith/ui/components/form/datePickerField'
import { DateTimeField } from '@openfaith/ui/components/form/dateTimeField'
import { InputField, SlugInputField } from '@openfaith/ui/components/form/inputField'
import { OTPField } from '@openfaith/ui/components/form/otpField'
import { SelectField } from '@openfaith/ui/components/form/selectField'
import { SingleComboboxField } from '@openfaith/ui/components/form/singleComboboxField'
import { SwitchField } from '@openfaith/ui/components/form/switchField'
import { TagInputField } from '@openfaith/ui/components/form/tagInputField'
import { TextareaField } from '@openfaith/ui/components/form/textareaField'
import type { RequiredFieldConfig } from '@openfaith/ui/form/fieldConfigGenerator'
import type { ComponentType } from 'react'

type FieldConfigType = RequiredFieldConfig
type FieldType = FieldConfigType['type']

/**
 * Maps field types to their corresponding React components
 */
export const getFieldComponent = (fieldType?: FieldType): ComponentType<any> => {
  const componentMap = {
    addressLocation: AddressLocationField,
    combobox: ComboboxField,
    date: DatePickerField,
    datetime: DateTimeField,
    email: InputField,
    number: InputField,
    otp: OTPField,
    password: InputField,
    select: SelectField,
    singleCombobox: SingleComboboxField,
    slug: SlugInputField,
    switch: SwitchField,
    tags: TagInputField,
    text: InputField,
    textarea: TextareaField,
  } as const

  if (!fieldType) {
    return InputField
  }

  return componentMap[fieldType] || InputField
}

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
      return {
        ...baseProps,
        // Date-specific props would go here
      }

    case 'switch':
      return {
        ...baseProps,
        // Switch-specific props would go here
      }

    case 'otp':
      return {
        ...baseProps,
        // OTP-specific props would go here
      }

    case 'slug':
      return {
        ...baseProps,
        // Slug-specific props would go here
      }

    case 'addressLocation':
      return {
        ...baseProps,
        // AddressLocation-specific props would go here
      }

    default:
      return baseProps
  }
}

/**
 * Type guard to check if a field type supports options
 */
export const fieldSupportsOptions = (fieldType?: FieldType): boolean => {
  return ['select', 'combobox', 'singleCombobox', 'tags'].includes(fieldType || '')
}

/**
 * Type guard to check if a field type supports multiple values
 */
export const fieldSupportsMultiple = (fieldType?: FieldType): boolean => {
  return ['combobox', 'tags'].includes(fieldType || '')
}

/**
 * Type guard to check if a field type supports search
 */
export const fieldSupportsSearch = (fieldType?: FieldType): boolean => {
  return ['combobox', 'singleCombobox'].includes(fieldType || '')
}
