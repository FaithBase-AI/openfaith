import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { useAppForm } from '@openfaith/ui/components/formFields/tsForm'
import { QuickActionForm } from '@openfaith/ui/components/quickActions/quickActionsComponents'
import { Button } from '@openfaith/ui/components/ui/button'
import { getComponentProps, getFieldComponentName } from '@openfaith/ui/form/fieldComponentMapping'
import { generateFieldConfigs } from '@openfaith/ui/form/fieldConfigGenerator'
import { createValidator, validateFormData } from '@openfaith/ui/form/validation'
import { Array, Order, pipe, Record, type Schema } from 'effect'
import { type ReactNode, useMemo } from 'react'

export interface UniversalFormProps<T> {
  schema: Schema.Schema<T>
  defaultValues?: Partial<T>
  onSubmit: (data: T) => void | Promise<void>
  fieldOverrides?: Partial<Record<keyof T, Partial<FieldConfig['field']>>>
  className?: string
  children?: (form: any, fields: Record<keyof T, Required<FieldConfig['field']>>) => ReactNode
  loading?: boolean
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
  loading = false,
}: UniversalFormProps<T>) {
  const fieldConfigs = generateFieldConfigs(schema, fieldOverrides)

  const form = useAppForm({
    defaultValues: (defaultValues ?? {}) as T,
    onSubmit: async ({ value }: { value: T }) => {
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

  const formFields = pipe(
    fieldConfigs,
    Record.toEntries,
    Array.map(([key, config]) => ({
      config,
      key,
      order: config?.order ?? 999,
    })),
    Array.sort(Order.struct({ order: Order.number })),
    Array.map(({ key, config }) => {
      const typedConfig = config as Required<NonNullable<FieldConfig['field']>>

      const componentProps = getComponentProps(typedConfig)
      const componentName = getFieldComponentName(typedConfig.type)

      return (
        <form.AppField
          key={String(key)}
          name={key as string}
          validators={{
            onChange: createValidator(typedConfig, schema, key as keyof T),
          }}
        >
          {(field) => {
            const FieldComponent = (field as any)[componentName]
            return <FieldComponent {...componentProps} />
          }}
        </form.AppField>
      )
    }),
  )

  return (
    <QuickActionForm
      Actions={
        <>
          <Button className='mr-auto' disabled={form.state.isSubmitting || loading} type='submit'>
            {form.state.isSubmitting || loading ? 'Submitting...' : 'Submit'}
          </Button>
          <Button disabled={loading} onClick={() => form.reset()} type='button' variant='outline'>
            Reset
          </Button>
        </>
      }
      className={className}
      form={form}
      Primary={<div className='flex flex-1 flex-col gap-3'>{formFields}</div>}
    />
  )
}

/**
 * Hook to get field configurations for a schema
 */
export function useFieldConfigs<T>(
  schema: Schema.Schema<T>,
  overrides: Partial<Record<keyof T, Partial<FieldConfig['field']>>> = {},
) {
  return useMemo(() => {
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
  return useMemo(() => {
    const configs = generateFieldConfigs(schema, {
      [fieldName]: overrides,
    } as any)
    return configs[fieldName]
  }, [schema, fieldName, overrides])
}
