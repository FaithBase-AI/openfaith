import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { useAppForm } from '@openfaith/ui/components/formFields/tsForm'
import { QuickActionForm } from '@openfaith/ui/components/quickActions/quickActionsComponents'
import { Button } from '@openfaith/ui/components/ui/button'
import { getComponentProps, getFieldComponentName } from '@openfaith/ui/form/fieldComponentMapping'
import { generateFieldConfigs } from '@openfaith/ui/form/fieldConfigGenerator'
import { createValidator, validateFormData } from '@openfaith/ui/form/validation'
import {
  useSchemaInsert,
  useSchemaUpdate,
  useSchemaUpsert,
} from '@openfaith/ui/shared/hooks/schemaHooks'
import { Array, Order, pipe, Record, type Schema } from 'effect'
import { type ReactNode, useMemo } from 'react'

export interface UniversalFormWithMutationProps<T> {
  schema: Schema.Schema<T>
  defaultValues?: Partial<T>
  mode?: 'insert' | 'update' | 'upsert'
  entityId?: string // Required for update mode
  onSuccess?: (data: T) => void
  onError?: (error: any) => void
  fieldOverrides?: Partial<Record<keyof T, Partial<FieldConfig['field']>>>
  className?: string
  children?: (form: any, fields: Record<keyof T, Required<FieldConfig['field']>>) => ReactNode
}

/**
 * Universal Form Component with Zero mutations built-in
 * Automatically handles insert, update, or upsert operations based on mode
 */
export function UniversalFormWithMutation<T>({
  schema,
  defaultValues,
  mode = 'insert',
  entityId,
  onSuccess,
  onError,
  fieldOverrides = {},
  className,
  children,
}: UniversalFormWithMutationProps<T>) {
  const fieldConfigs = generateFieldConfigs(schema, fieldOverrides)

  // Use the appropriate mutation hook based on mode
  const insertMutation = useSchemaInsert(schema, {
    onError,
    onSuccess,
  })

  const updateMutation = useSchemaUpdate(schema, {
    onError,
    onSuccess: onSuccess as any,
  })

  const upsertMutation = useSchemaUpsert(schema, {
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

      // Execute the appropriate mutation based on mode
      switch (mode) {
        case 'update':
          if (!entityId) {
            console.error('Entity ID is required for update mode')
            if (onError) {
              onError(new Error('Entity ID is required for update'))
            }
            return
          }
          updateMutation.mutate({ ...validData, id: entityId } as any)
          break

        case 'upsert':
          upsertMutation.mutate({
            ...validData,
            id: entityId || undefined,
          } as any)
          break
        default:
          insertMutation.mutate(validData as any)
          break
      }
    },
  })
  // Check if any mutation is in progress
  const isSubmitting =
    insertMutation.isPending || updateMutation.isPending || upsertMutation.isPending

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

  const submitButtonText = useMemo(() => {
    if (isSubmitting) {
      return 'Submitting...'
    }
    switch (mode) {
      case 'update':
        return 'Update'
      case 'upsert':
        return 'Save'
      default:
        return 'Create'
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
