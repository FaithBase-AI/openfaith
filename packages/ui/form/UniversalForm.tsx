import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { Form } from '@openfaith/ui/components/formFields/form'
import { useAppForm } from '@openfaith/ui/components/formFields/tsForm'
import { getComponentProps, getFieldComponentName } from '@openfaith/ui/form/fieldComponentMapping'
import { generateFieldConfigs } from '@openfaith/ui/form/fieldConfigGenerator'
import { createValidator, validateFormData } from '@openfaith/ui/form/validation'
import type { Schema } from 'effect'
import React from 'react'

export interface UniversalFormProps<T> {
  schema: Schema.Schema<T>
  defaultValues?: Partial<T>
  onSubmit: (data: T) => void | Promise<void>
  fieldOverrides?: Partial<Record<keyof T, Partial<FieldConfig['field']>>>
  className?: string
  children?: (form: any, fields: Record<keyof T, Required<FieldConfig['field']>>) => React.ReactNode
}

/**
 * Universal Form Component that automatically generates forms from Effect Schema
 */
export function UniversalForm<T>({
  schema,
  defaultValues,
  onSubmit,
  fieldOverrides = {},
  className,
  children,
}: UniversalFormProps<T>) {
  const fieldConfigs = generateFieldConfigs(schema, fieldOverrides)

  const form = useAppForm({
    defaultValues: (defaultValues ?? {}) as T,
    onSubmit: async ({ value }: { value: T }) => {
      // Validate with Effect Schema before submitting
      const validation = validateFormData(schema, value)
      if (!validation.isValid) {
        console.error('Schema validation failed:', validation.errors)
        return
      }
      await onSubmit(validation.data!)
    },
  })

  if (children) {
    return <div className={className}>{children(form, fieldConfigs)}</div>
  }

  // Default auto-generated layout
  return (
    <Form className={className} form={form}>
      <div className='space-y-4'>
        {Object.entries(fieldConfigs).map(([key, config]) => {
          // Type assertion is safe here because generateFieldConfigs returns Required configs
          const typedConfig = config as Required<NonNullable<FieldConfig['field']>>

          const componentProps = getComponentProps(typedConfig)
          const componentName = getFieldComponentName(typedConfig.type)

          return (
            <form.AppField
              key={key}
              name={key}
              validators={{
                onChange: createValidator(typedConfig, schema, key as keyof T),
              }}
            >
              {(field) => {
                // Access the field component from the registered components
                const FieldComponent = (field as any)[componentName]
                return <FieldComponent {...componentProps} />
              }}
            </form.AppField>
          )
        })}
      </div>

      <div className='mt-6 flex gap-2'>
        <button className='btn btn-primary' disabled={form.state.isSubmitting} type='submit'>
          {form.state.isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
        <button className='btn btn-secondary' onClick={() => form.reset()} type='button'>
          Reset
        </button>
      </div>
    </Form>
  )
}

/**
 * Hook to get field configurations for a schema
 */
export function useFieldConfigs<T>(
  schema: Schema.Schema<T>,
  overrides: Partial<Record<keyof T, Partial<FieldConfig['field']>>> = {},
) {
  return React.useMemo(() => {
    return generateFieldConfigs(schema, overrides)
  }, [schema, overrides])
}

/**
 * Hook to get a single field configuration
 */
export function useFieldConfig<T>(
  schema: Schema.Schema<T>,
  fieldName: keyof T,
  overrides: Partial<FieldConfig['field']> = {},
) {
  return React.useMemo(() => {
    const configs = generateFieldConfigs(schema, {
      [fieldName]: overrides,
    } as any)
    return configs[fieldName]
  }, [schema, fieldName, overrides])
}
