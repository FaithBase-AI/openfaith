import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { useAppForm } from '@openfaith/ui/components/form/tsForm'
import { QuickActionForm } from '@openfaith/ui/components/quickActions/quickActionsComponents'
import { Button } from '@openfaith/ui/components/ui/button'
import { getComponentProps, getFieldComponentName } from '@openfaith/ui/form/fieldComponentMapping'
import { generateFieldConfigs } from '@openfaith/ui/form/fieldConfigGenerator'
import { createValidator, validateFormData } from '@openfaith/ui/form/validation'
import { useSchemaInsert, useSchemaUpdate } from '@openfaith/ui/shared/hooks/schemaHooks'
import { Array, Order, pipe, Record, type Schema } from 'effect'
import { useMemo } from 'react'

export interface UniversalFormProps<T> {
  schema: Schema.Schema<T>
  defaultValues?: Partial<T>
  onSubmit?: (data: T) => void | Promise<void>
  mode?: 'create' | 'edit' | 'custom'
  onSuccess?: (data: T) => void
  onError?: (error: any) => void
  fieldOverrides?: Partial<Record<keyof T, Partial<FieldConfig['field']>>>
  className?: string
  loading?: boolean
}

/**
 * Universal Form Component that automatically generates forms from Effect Schema
 * Supports both custom submit handlers and built-in Zero mutations
 */
export function UniversalForm<T>({
  schema,
  defaultValues,
  onSubmit,
  mode = 'custom',
  onSuccess,
  onError,
  fieldOverrides = {},
  className,
  loading = false,
}: UniversalFormProps<T>) {
  const fieldConfigs = generateFieldConfigs(schema, fieldOverrides)

  // Use mutation hooks when in create/edit mode
  const { mutate: schemaInsert, isPending: isInsertPending } = useSchemaInsert(schema, {
    onError,
    onSuccess,
  })

  const { mutate: schemaUpdate, isPending: isUpdatePending } = useSchemaUpdate(schema, {
    onError,
    onSuccess: onSuccess as any,
  })

  const form = useAppForm({
    defaultValues: (defaultValues ?? {}) as T,
    onSubmit: async ({ value }: { value: T }) => {
      const validation = validateFormData(schema, value)
      if (!validation.isValid) {
        console.error('Schema validation failed:', validation.errors)
        if (onError) {
          onError(new Error('Validation failed'))
        }
        return
      }

      const validData = validation.data!

      // Use appropriate handler based on mode
      switch (mode) {
        case 'create':
          schemaInsert(validData as any)
          break
        case 'edit':
          schemaUpdate(validData as any)
          break
        default:
          if (onSubmit) {
            await onSubmit(validData)
          }
          break
      }
    },
  })

  // Check if any mutation is in progress
  const isMutating = isInsertPending || isUpdatePending
  const isSubmitting = form.state.isSubmitting || loading || isMutating

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

  const submitButtonText = useMemo(() => {
    if (isSubmitting) {
      return 'Submitting...'
    }
    switch (mode) {
      case 'create':
        return 'Create'
      case 'edit':
        return 'Update'
      default:
        return 'Submit'
    }
  }, [mode, isSubmitting])

  return (
    <QuickActionForm
      Actions={
        <>
          <Button className='mr-auto' disabled={isSubmitting} type='submit'>
            {submitButtonText}
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => form.reset()}
            type='button'
            variant='outline'
          >
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
