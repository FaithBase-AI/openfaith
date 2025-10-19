import {
  extractAST,
  extractSchemaFields,
  getCreateSchema,
  getUpdateSchema,
} from '@openfaith/schema'
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
import { Array, HashSet, Option, Order, pipe, Record, Schema } from 'effect'
import { useMemo } from 'react'

/**
 * Transforms a schema to handle composite fields for form validation
 * Replaces individual composite fields with a single nested object schema
 *
 * Based on the pattern used in getZeroMutationSchema from @openfaith/schema
 */
const getFormValidationSchema = <T,>(
  baseSchema: Schema.Schema<T>,
  fieldConfigs: Record<keyof T, RequiredFieldConfig>,
): Schema.Schema<any> => {
  const fields = extractSchemaFields(baseSchema)

  // Track which fields are part of composite groups using HashSet
  let compositeFieldsToRemove = HashSet.empty<string>()

  // Build composite schemas
  const compositeSchemas: Record<string, any> = {}

  // First pass: identify composite fields and build composite schemas
  pipe(
    fieldConfigs,
    Record.toEntries,
    Array.forEach(([key, config]) => {
      const typedConfig = config as RequiredFieldConfig

      if (typedConfig.composite && typedConfig.composite.length > 0) {
        // Mark individual composite fields for removal
        pipe(
          typedConfig.composite,
          Array.forEach((fieldName) => {
            compositeFieldsToRemove = pipe(compositeFieldsToRemove, HashSet.add(fieldName))
          }),
        )

        // Build the composite object schema from the individual field schemas
        const compositeFields: Record<string, any> = {}

        pipe(
          typedConfig.composite,
          Array.forEach((fieldName) => {
            const fieldOpt = pipe(
              fields,
              Array.findFirst((f) => f.key === fieldName),
            )

            pipe(
              fieldOpt,
              Option.match({
                onNone: () => {},
                onSome: (field) => {
                  const fieldAst = extractAST(field.schema)

                  // Create schema from AST, respecting optional/nullable
                  // Use optionalWith for struct fields (not Schema.optional which returns wrapped type)
                  if (field.isOptional) {
                    compositeFields[fieldName] = Schema.optionalWith(Schema.make(fieldAst), {
                      exact: true,
                    })
                  } else if (field.isNullable) {
                    compositeFields[fieldName] = pipe(Schema.make(fieldAst), Schema.NullOr)
                  } else {
                    compositeFields[fieldName] = Schema.make(fieldAst)
                  }
                },
              }),
            )
          }),
        )

        // Create the composite object schema (optional since form might not have it set)
        compositeSchemas[key as string] = Schema.optionalWith(Schema.Struct(compositeFields), {
          exact: true,
        })
      }
    }),
  )

  // Second pass: build new schema with composite fields
  const transformedFields: Record<string, any> = {}

  pipe(
    fields,
    Array.forEach((field) => {
      // Skip fields that are part of a composite group
      if (pipe(compositeFieldsToRemove, HashSet.has(field.key))) {
        return
      }

      const fieldAst = extractAST(field.schema)

      // Add regular field, preserving optional/nullable
      if (field.isOptional) {
        transformedFields[field.key] = Schema.optionalWith(Schema.make(fieldAst), { exact: true })
      } else if (field.isNullable) {
        transformedFields[field.key] = pipe(Schema.make(fieldAst), Schema.NullOr)
      } else {
        transformedFields[field.key] = Schema.make(fieldAst)
      }
    }),
  )

  // Add composite schemas
  pipe(
    compositeSchemas,
    Record.toEntries,
    Array.forEach(([key, schema]) => {
      transformedFields[key] = schema
    }),
  )

  return Schema.Struct(transformedFields) as any
}

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

  const transformedDefaultValues = useMemo(() => {
    if (!defaultValues) {
      return {} as T
    }

    return pipe(
      fieldConfigs,
      Record.toEntries,
      Array.reduce({ ...defaultValues } as Record<string, any>, (acc, [key, config]) => {
        const typedConfig = config as RequiredFieldConfig

        if (typedConfig.composite && typedConfig.composite.length > 0) {
          const compositeValue: Record<string, any> = {}

          pipe(
            typedConfig.composite,
            Array.forEach((fieldName) => {
              if (fieldName in acc && acc[fieldName] != null) {
                compositeValue[fieldName] = acc[fieldName]
                delete acc[fieldName] // Remove individual field
              }
            }),
          )

          if (!pipe(compositeValue, Record.isEmptyRecord)) {
            // Only set composite if it has values
            acc[key] = compositeValue
          }
        }

        return acc
      }),
    ) as T
  }, [defaultValues, fieldConfigs])

  const form = useAppForm({
    defaultValues: transformedDefaultValues,
    onSubmit: async ({ value }: { value: T }) => {
      const flattenedValue = pipe(
        fieldConfigs,
        Record.toEntries,
        Array.reduce({ ...value } as Record<string, any>, (acc, [key, config]) => {
          const typedConfig = config as RequiredFieldConfig
          if (typedConfig.composite && typedConfig.composite.length > 0) {
            const compositeValue = acc[key]
            if (compositeValue && typeof compositeValue === 'object') {
              pipe(
                typedConfig.composite,
                Array.forEach((fieldName) => {
                  if (fieldName in compositeValue) {
                    acc[fieldName] = compositeValue[fieldName]
                  }
                }),
              )
            }
          }

          return acc
        }),
      )

      try {
        switch (mode) {
          case 'create': {
            insertEntity([flattenedValue as Partial<T>])
            break
          }
          case 'edit':
            updateEntity([flattenedValue as Partial<T> & { id: string }])
            break
        }

        if (onSubmit) {
          await onSubmit(flattenedValue as T)
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
        getFormValidationSchema(
          mode === 'create' ? getCreateSchema(schema) : getUpdateSchema(schema),
          fieldConfigs,
        ),
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
