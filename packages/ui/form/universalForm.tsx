import { getCreateSchema, getUpdateSchema } from '@openfaith/schema'
import type { FieldConfig } from '@openfaith/schema/shared/schema'
import { useAppForm } from '@openfaith/ui/components/form/tsForm'
import { QuickActionForm } from '@openfaith/ui/components/quickActions/quickActionsComponents'
import { Button } from '@openfaith/ui/components/ui/button'
import { getComponentProps, getFieldComponentName } from '@openfaith/ui/form/fieldComponentMapping'
import {
  generateFieldConfigs,
  type RequiredFieldConfig,
} from '@openfaith/ui/form/fieldConfigGenerator'
import { useSchemaInsert, useSchemaUpdate } from '@openfaith/ui/shared/hooks/schemaMutations'
import { revalidateLogic } from '@tanstack/react-form'
import { Array, Order, pipe, Record, Schema } from 'effect'
import { useMemo } from 'react'

export interface UniversalFormProps<T> {
  schema: Schema.Schema<T>
  defaultValues?: Partial<T>
  onSubmit?: (data: T) => void | Promise<void>
  mode?: 'create' | 'edit' | 'custom'
  fieldOverrides?: Partial<Record<keyof T, Partial<FieldConfig['field']>>>
  className?: string
  entityType: string
  orgId: string
  userId: string
}

/**
 * Universal Form Component that automatically generates forms from Effect Schema
 * Supports both custom submit handlers and built-in Zero mutations
 */
export function UniversalForm<T extends Record<string, any> & { id: string }>(
  props: UniversalFormProps<T>,
) {
  const {
    schema,
    defaultValues,
    onSubmit,
    mode = 'custom',
    fieldOverrides = {},
    className,
    entityType,
    orgId,
    userId,
  } = props
  const fieldConfigs = generateFieldConfigs(schema, fieldOverrides)

  const [, updateEntity] = useSchemaUpdate({
    entityType,
    orgId,
    schema,
    userId,
  })
  const [, insertEntity] = useSchemaInsert({
    entityType,
    orgId,
    schema,
    userId,
  })

  const form = useAppForm({
    defaultValues: (defaultValues ?? {}) as T,
    onSubmit: async ({ value }: { value: T }) => {
      try {
        switch (mode) {
          case 'create': {
            insertEntity([value])
            break
          }
          case 'edit':
            updateEntity([value])
            break
          default:
            if (onSubmit) {
              await onSubmit(value)
            }
            break
        }
      } catch (error) {
        console.error(error)
      }
    },
    validationLogic: revalidateLogic({
      mode: 'submit',
      modeAfterSubmission: 'blur',
    }),
    validators: {
      onDynamic: Schema.standardSchemaV1(
        mode === 'create' ? getCreateSchema(schema) : getUpdateSchema(schema),
      ),
    },
  })

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
      const typedConfig = config as RequiredFieldConfig

      const componentProps = getComponentProps(typedConfig)
      const componentName = getFieldComponentName(typedConfig.type)

      return (
        <form.AppField key={String(key)} name={key as string}>
          {(field) => {
            const FieldComponent = (field as any)[componentName]
            return <FieldComponent {...componentProps} />
          }}
        </form.AppField>
      )
    }),
  )

  const submitButtonText = useMemo(() => {
    switch (mode) {
      case 'create':
        return 'Create'
      case 'edit':
        return 'Update'
      default:
        return 'Submit'
    }
  }, [mode])

  return (
    <QuickActionForm
      Actions={
        <form.Subscribe
          selector={(state) => ({
            isDefaultValue: state.isDefaultValue,
            isSubmitting: state.isSubmitting,
          })}
        >
          {({ isSubmitting, isDefaultValue }) => (
            <Button
              className='mr-auto'
              disabled={isDefaultValue}
              loading={isSubmitting}
              type='submit'
            >
              {submitButtonText}
            </Button>
          )}
        </form.Subscribe>
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
