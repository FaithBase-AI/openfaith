import { Atom, Result, useAtomValue } from '@effect-atom/atom-react'
import { getFieldErrors } from '@openfaith/ui/components/form/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/form/tsField'
import { Combobox } from '@openfaith/ui/components/ui/combobox'
import { ByLineComboboxItemComponent } from '@openfaith/ui/components/ui/combobox-items'
import { SelectComboBoxTrigger } from '@openfaith/ui/components/ui/combobox-triggers'
import type { ByLineComboboxItem } from '@openfaith/ui/components/ui/combobox-types'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { cn } from '@openfaith/ui/shared/utils'
import { Array, Effect, Option, pipe, Schema, String } from 'effect'
import type { ComponentProps, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { useDebounce } from 'use-debounce'

export class PhotonApiError extends Schema.TaggedError<PhotonApiError>()('PhotonApiError', {
  cause: Schema.optional(Schema.Unknown),
  message: Schema.String,
  query: Schema.String,
}) {}

const CoordinatesSchema = Schema.transform(
  Schema.Tuple(Schema.Number, Schema.Number),
  Schema.Struct({
    latitude: Schema.Number,
    longitude: Schema.Number,
  }),
  {
    decode: ([longitude, latitude]) => ({ latitude, longitude }),
    encode: ({ longitude, latitude }) => [longitude, latitude] as const,
    strict: true,
  },
)

const PhotonFeatureSchema = Schema.Struct({
  geometry: Schema.Struct({
    coordinates: CoordinatesSchema,
    type: Schema.Literal('Point'),
  }),
  properties: Schema.Struct({
    city: Schema.optional(Schema.String),
    country: Schema.optional(Schema.String),
    countrycode: Schema.optional(Schema.String),
    county: Schema.optional(Schema.String),
    housenumber: Schema.optional(Schema.String),
    name: Schema.optional(Schema.String),
    osm_id: Schema.Number,
    osm_key: Schema.String,
    osm_type: Schema.String,
    osm_value: Schema.String,
    postcode: Schema.optional(Schema.String),
    state: Schema.optional(Schema.String),
    street: Schema.optional(Schema.String),
  }),
  type: Schema.Literal('Feature'),
})

const PhotonResponseSchema = Schema.Struct({
  features: Schema.Array(PhotonFeatureSchema),
  type: Schema.Literal('FeatureCollection'),
})

export type PhotonFeature = Schema.Schema.Type<typeof PhotonFeatureSchema>
export type PhotonResponse = Schema.Schema.Type<typeof PhotonResponseSchema>

export type AddressLocation = {
  id: string
  name: string
  byLine: string
  street?: string
  housenumber?: string
  city?: string
  state?: string
  postcode?: string
  country?: string
  countrycode?: string
  county?: string
  coordinates: {
    latitude: number
    longitude: number
  }
  osmId: number
}

const formatAddressName = (feature: PhotonFeature): string => {
  const props = feature.properties

  if (props.housenumber && props.street) {
    return `${props.housenumber} ${props.street}`
  }

  if (props.street) {
    return props.street
  }

  if (props.name) {
    return props.name
  }

  return 'Unknown Location'
}

const formatAddressByLine = (feature: PhotonFeature): string => {
  const props = feature.properties
  const parts: Array<string> = []

  if (props.city) {
    parts.push(props.city)
  }

  if (props.state) {
    parts.push(props.state)
  }

  if (props.postcode) {
    parts.push(props.postcode)
  }

  if (props.country) {
    parts.push(props.country)
  }

  return pipe(
    parts,
    Array.match({
      onEmpty: () => '',
      onNonEmpty: (items) => pipe(items, Array.join(', ')),
    }),
  )
}

const featureToAddressLocation = (feature: PhotonFeature): AddressLocation => {
  const props = feature.properties
  return {
    byLine: formatAddressByLine(feature),
    city: props.city,
    coordinates: feature.geometry.coordinates,
    country: props.country,
    countrycode: props.countrycode,
    county: props.county,
    housenumber: props.housenumber,
    id: `${feature.properties.osm_type}-${feature.properties.osm_id}`,
    name: props.name || formatAddressName(feature),
    osmId: props.osm_id,
    postcode: props.postcode,
    state: props.state,
    street: props.street,
  }
}

const searchPhotonApi = Effect.fn('searchPhotonApi')(function* (query: string) {
  yield* Effect.annotateCurrentSpan('query', query)

  if (pipe(query, String.trim, String.isEmpty)) {
    return []
  }

  const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=10`

  const response = yield* Effect.tryPromise({
    catch: (cause) =>
      new PhotonApiError({ cause, message: 'Failed to fetch from Photon API', query }),
    try: () => fetch(url),
  })

  if (!response.ok) {
    return yield* Effect.fail(
      new PhotonApiError({
        message: `Photon API returned status ${response.status}`,
        query,
      }),
    )
  }

  const json = yield* Effect.tryPromise({
    catch: (cause) =>
      new PhotonApiError({ cause, message: 'Failed to parse Photon API response', query }),
    try: () => response.json(),
  })

  const validated = yield* Schema.decodeUnknown(PhotonResponseSchema)(json)

  return pipe(validated.features, Array.map(featureToAddressLocation))
})

const searchAtom = Atom.family((query: string) => Atom.make(searchPhotonApi(query)))

export type AddressLocationFieldProps = Omit<
  ComponentProps<typeof Combobox>,
  'selectedOptions' | 'addItem' | 'removeItem' | 'mode' | 'emptyText' | 'options' | 'onSearchChange'
> & {
  label?: ReactNode
  labelClassName?: string
  wrapperClassName?: string
  errorClassName?: string
  placeholder?: string
  className?: string
  required?: boolean
  onLocationSelect?: (location: AddressLocation | null) => void
}

export const AddressLocationField = (props: AddressLocationFieldProps) => {
  const {
    label,
    wrapperClassName,
    labelClassName,
    errorClassName,
    required = false,
    disabled = false,
    className,
    placeholder = 'Search for an address...',
    onLocationSelect,
    popOverContentClassName,
    alignOffset = 0,
    ...domProps
  } = props

  const field = useFieldContext<AddressLocation | null>()
  const [searchQuery, setSearchQuery] = useState('')

  const [debouncedSearchQuery] = useDebounce(searchQuery, 250)

  const value = pipe(
    field.state.value,
    Option.fromNullable,
    Option.getOrElse((): AddressLocation | null => null),
  )

  const { processedError } = getFieldErrors(field.state.meta.errors)

  const searchResult = useAtomValue(searchAtom(debouncedSearchQuery))

  const locations = Result.match(searchResult, {
    onFailure: () => [] as Array<AddressLocation>,
    onInitial: () => [] as Array<AddressLocation>,
    onSuccess: (result) => result.value,
  })

  const options: Array<ByLineComboboxItem & { location?: AddressLocation }> = pipe(
    locations,
    Array.map((location) => ({
      _tag: 'address' as const,
      byLine: location.byLine,
      id: location.id,
      location,
      name: location.name,
    })),
  )

  const selectedOptions = pipe(
    value,
    Option.fromNullable,
    Option.match({
      onNone: () => [] as Array<ByLineComboboxItem>,
      onSome: (location) => [
        {
          _tag: 'address' as const,
          byLine: location.byLine,
          id: location.id,
          name: location.name,
        },
      ],
    }),
  )

  const handleSearchChange = useCallback((params: { searchValue: string }) => {
    setSearchQuery(params.searchValue)
  }, [])

  const handleAddItem = useCallback(
    (id: string) => {
      const selectedLocationOpt = pipe(
        locations,
        Array.findFirst((loc) => loc.id === id),
      )

      pipe(
        selectedLocationOpt,
        Option.match({
          onNone: () => {
            field.handleChange(null)
            if (onLocationSelect) {
              onLocationSelect(null)
            }
          },
          onSome: (location) => {
            field.handleChange(location)
            if (onLocationSelect) {
              onLocationSelect(location)
            }
          },
        }),
      )
    },
    [locations, field, onLocationSelect],
  )

  const handleRemoveItem = useCallback(() => {
    field.handleChange(null)
    if (onLocationSelect) {
      onLocationSelect(null)
    }
  }, [field, onLocationSelect])

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
      <Combobox<ByLineComboboxItem>
        addItem={handleAddItem}
        alignOffset={alignOffset}
        ComboboxItem={ByLineComboboxItemComponent}
        ComboboxTrigger={SelectComboBoxTrigger}
        className={className}
        disabled={disabled}
        emptyText={placeholder}
        hideAvatar
        mode={'single'}
        onSearchChange={handleSearchChange}
        options={options}
        popOverContentClassName={cn('w-(--radix-popover-trigger-width)', popOverContentClassName)}
        removeItem={handleRemoveItem}
        selectedOptions={selectedOptions}
        showAllOptions
        {...domProps}
      />
    </InputWrapper>
  )
}
