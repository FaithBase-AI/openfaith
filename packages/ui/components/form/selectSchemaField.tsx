import { singularize } from '@openfaith/shared'
import { getFieldErrors } from '@openfaith/ui/components/form/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/form/tsField'
import { Combobox } from '@openfaith/ui/components/ui/combobox'
import { SelectComboBoxTrigger } from '@openfaith/ui/components/ui/combobox-triggers'
import type { BaseComboboxItem } from '@openfaith/ui/components/ui/combobox-types'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import {
  extractEntityDisplayName,
  getSchemaByEntityType,
  useSchemaCollectionFull,
} from '@openfaith/ui/shared/hooks/schemaHooks'
import { cn } from '@openfaith/ui/shared/utils'
import { Array, Option, pipe, Schema, type Schema as SchemaType } from 'effect'
import { type ComponentProps, type ReactNode, useMemo } from 'react'

const BaseOptionSchema = Schema.Struct({
  id: Schema.String,
})

export type SelectSchemaFieldProps = Omit<
  ComponentProps<typeof Combobox>,
  'selectedOptions' | 'addItem' | 'removeItem' | 'mode' | 'emptyText' | 'options'
> & {
  schemaName: string
  includeNone?: boolean
  noneLabel?: string
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  placeholder?: string
  className?: string
  required?: boolean
}

export const SelectSchemaField = (props: SelectSchemaFieldProps) => {
  const {
    schemaName,
    includeNone = true,
    noneLabel = 'None (unlink)',
    label,
    wrapperClassName,
    labelClassName,
    errorClassName,
    required = false,
    disabled = false,
    className,
    placeholder,
    popOverContentClassName,
    alignOffset = 0,
    ...domProps
  } = props

  const field = useFieldContext<string | null>()

  const schemaOpt = useMemo(() => getSchemaByEntityType(schemaName), [schemaName])

  if (Option.isNone(schemaOpt)) {
    return <div className='text-muted-foreground text-sm'>Schema not found for: {schemaName}</div>
  }

  return (
    <SelectSchemaFieldInner
      {...domProps}
      alignOffset={alignOffset}
      className={className}
      disabled={disabled}
      errorClassName={errorClassName}
      field={field}
      includeNone={includeNone}
      label={label}
      labelClassName={labelClassName}
      noneLabel={noneLabel}
      placeholder={placeholder}
      popOverContentClassName={popOverContentClassName}
      required={required}
      schema={schemaOpt.value}
      schemaName={schemaName}
      wrapperClassName={wrapperClassName}
    />
  )
}

type InnerProps<T = unknown> = Omit<
  ComponentProps<typeof Combobox>,
  'selectedOptions' | 'addItem' | 'removeItem' | 'mode' | 'emptyText' | 'options'
> & {
  schema: SchemaType.Schema<T>
  schemaName: string
  includeNone: boolean
  noneLabel: string
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  placeholder?: string
  className?: string
  required?: boolean
  field: ReturnType<typeof useFieldContext<string | null>>
}

const SelectSchemaFieldInner = <T,>(props: InnerProps<T>) => {
  const {
    schema,
    schemaName,
    includeNone,
    noneLabel,
    label,
    wrapperClassName,
    labelClassName,
    errorClassName,
    required = false,
    disabled = false,
    className,
    placeholder,
    popOverContentClassName,
    alignOffset = 0,
    field,
    ...domProps
  } = props

  const { collection, loading } = useSchemaCollectionFull({ schema })

  const options: ReadonlyArray<BaseComboboxItem> = useMemo(
    () =>
      pipe(
        collection,
        Array.filterMap((entity): Option.Option<BaseComboboxItem> => {
          return pipe(
            Schema.decodeUnknownOption(BaseOptionSchema)(entity, { onExcessProperty: 'preserve' }),
            Option.map((x) => ({
              id: x.id,
              name: extractEntityDisplayName(entity, schemaName, x.id),
            })),
          )
        }),
        Array.appendAll(includeNone ? [{ id: '', name: noneLabel }] : []),
      ),
    [collection, includeNone, noneLabel, schemaName],
  )

  const entityTitle = useMemo(() => singularize(schemaName), [schemaName])

  const value = pipe(
    field.state.value,
    Option.fromNullable,
    Option.getOrElse((): string | null => null),
  )

  const { processedError } = getFieldErrors(field.state.meta.errors)

  const selectedOptions = pipe(
    options,
    Array.filter((x) => x.id === value),
  )

  return (
    <InputWrapper
      className={wrapperClassName}
      errorClassName={errorClassName}
      label={label}
      labelClassName={labelClassName}
      name={field.name}
      processedError={processedError}
      required={required}
    >
      <Combobox
        addItem={(id) => {
          field.handleChange(id)
        }}
        alignOffset={alignOffset}
        ComboboxTrigger={SelectComboBoxTrigger}
        className={className}
        disabled={disabled || loading}
        emptyText={placeholder || `Select ${entityTitle}...`}
        mode={'single'}
        options={options}
        popOverContentClassName={cn('w-(--radix-popover-trigger-width)', popOverContentClassName)}
        removeItem={() => {
          field.handleChange(null)
        }}
        selectedOptions={selectedOptions}
        {...domProps}
      />
    </InputWrapper>
  )
}
