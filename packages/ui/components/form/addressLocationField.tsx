import { Atom, Result, useAtomValue } from '@effect-atom/atom-react'
import type { CompositeAddressValue } from '@openfaith/shared'
import { formatAddress } from '@openfaith/shared'
import { env } from '@openfaith/shared/env'
import { getFieldErrors } from '@openfaith/ui/components/form/fieldHelpers'
import { useFieldContext } from '@openfaith/ui/components/form/tsField'
import { Combobox } from '@openfaith/ui/components/ui/combobox'
import { AddressComboboxItemComponent } from '@openfaith/ui/components/ui/combobox-items'
import { SelectComboBoxTrigger } from '@openfaith/ui/components/ui/combobox-triggers'
import type { AddressComboboxItem } from '@openfaith/ui/components/ui/combobox-types'
import { InputWrapper } from '@openfaith/ui/components/ui/input-wrapper'
import { cn } from '@openfaith/ui/shared/utils'
import { Array, Effect, Option, pipe, Schema, String } from 'effect'
import type { ComponentProps, ReactNode } from 'react'
import { useCallback, useMemo, useState } from 'react'
import { useDebounce } from 'use-debounce'

export class GooglePlacesApiError extends Schema.TaggedError<GooglePlacesApiError>()(
  'GooglePlacesApiError',
  {
    cause: Schema.optional(Schema.Unknown),
    message: Schema.String,
    query: Schema.String,
  },
) {}

const GooglePlaceLocationSchema = Schema.Struct({
  latitude: Schema.Number,
  longitude: Schema.Number,
})

const GooglePlaceAddressComponentSchema = Schema.Struct({
  longText: Schema.String,
  shortText: Schema.optional(Schema.String),
  types: Schema.Array(Schema.String),
})

const GooglePlaceDisplayNameSchema = Schema.Struct({
  text: Schema.String,
})

const GooglePlaceSchema = Schema.Struct({
  addressComponents: Schema.optional(Schema.Array(GooglePlaceAddressComponentSchema)),
  displayName: Schema.optional(GooglePlaceDisplayNameSchema),
  formattedAddress: Schema.String,
  id: Schema.String,
  location: GooglePlaceLocationSchema,
})

const GooglePlacesResponseSchema = Schema.Struct({
  places: Schema.optional(Schema.Array(GooglePlaceSchema)),
})

export type GooglePlace = Schema.Schema.Type<typeof GooglePlaceSchema>
export type GooglePlacesResponse = Schema.Schema.Type<typeof GooglePlacesResponseSchema>

export type AddressLocation = {
  id: string
  name: string
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
  placeId: string
}

const getAddressComponent = (place: GooglePlace, types: Array<string>): string | undefined => {
  if (!place.addressComponents) {
    return undefined
  }

  const componentOpt = pipe(
    place.addressComponents,
    Array.findFirst((component) =>
      pipe(
        types,
        Array.some((type) => pipe(component.types, Array.contains(type))),
      ),
    ),
  )

  return pipe(
    componentOpt,
    Option.map((component) => component.longText),
    Option.getOrUndefined,
  )
}

const placeToAddressLocation = (place: GooglePlace): AddressLocation => {
  const streetNumber = getAddressComponent(place, ['street_number'])
  const route = getAddressComponent(place, ['route'])

  const streetParts = [streetNumber, route]
  const street = pipe(streetParts, Array.filterMap(Option.fromNullable), Array.join(' '))

  const placeName = pipe(
    Option.fromNullable(place.displayName?.text),
    Option.orElse(() => Option.fromNullable(street)),
    Option.orElse(() => pipe(place.formattedAddress, String.split(','), Array.head)),
    Option.getOrElse(() => 'Unknown Location'),
  )

  return {
    city: getAddressComponent(place, ['locality', 'postal_town']),
    coordinates: place.location,
    country: getAddressComponent(place, ['country']),
    countrycode: getAddressComponent(place, ['country']),
    county: getAddressComponent(place, ['administrative_area_level_2']),
    housenumber: streetNumber,
    id: place.id,
    name: placeName,
    placeId: place.id,
    postcode: getAddressComponent(place, ['postal_code']),
    state: getAddressComponent(place, [
      'administrative_area_level_1',
      'administrative_area_level_2',
    ]),
    street: route,
  }
}

const searchGooglePlaces = Effect.fn('searchGooglePlaces')(function* (query: string) {
  yield* Effect.annotateCurrentSpan('query', query)

  if (pipe(query, String.trim, String.isEmpty)) {
    return []
  }

  const url = 'https://places.googleapis.com/v1/places:searchText'

  const response = yield* Effect.tryPromise({
    catch: (cause) =>
      new GooglePlacesApiError({
        cause,
        message: 'Failed to fetch from Google Places API',
        query,
      }),
    try: () =>
      fetch(url, {
        body: JSON.stringify({
          textQuery: query,
        }),
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': env.VITE_GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask':
            'places.id,places.formattedAddress,places.addressComponents,places.location,places.displayName',
        },
        method: 'POST',
      }),
  })

  if (!response.ok) {
    return yield* Effect.fail(
      new GooglePlacesApiError({
        message: `Google Places API returned status ${response.status}`,
        query,
      }),
    )
  }

  const json = yield* Effect.tryPromise({
    catch: (cause) =>
      new GooglePlacesApiError({
        cause,
        message: 'Failed to parse Google Places API response',
        query,
      }),
    try: () => response.json(),
  })

  const validated = yield* Schema.decodeUnknown(GooglePlacesResponseSchema)(json)

  return pipe(
    validated.places,
    Option.fromNullable,
    Option.match({
      onNone: () => [],
      onSome: (places) => pipe(places, Array.map(placeToAddressLocation)),
    }),
  )
})

const searchAtom = Atom.family((query: string) => Atom.make(searchGooglePlaces(query)))

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
  composite?: Array<string>
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
    composite,
    ...domProps
  } = props

  const field = useFieldContext<CompositeAddressValue | null>()
  const form = field.form
  const [searchQuery, setSearchQuery] = useState('')

  const [debouncedSearchQuery] = useDebounce(searchQuery, 250)

  const currentCompositeValue = useMemo(() => {
    if (!composite || composite.length === 0) {
      return pipe(
        field.state.value,
        Option.fromNullable,
        Option.getOrElse((): CompositeAddressValue | null => null),
      )
    }

    const compositeValue: Record<string, any> = {}
    pipe(
      composite,
      Array.forEach((fieldName) => {
        const value = (form as any).getFieldValue(fieldName)
        if (value !== undefined && value !== null) {
          compositeValue[fieldName] = value
        }
      }),
    )

    return Object.keys(compositeValue).length > 0 ? (compositeValue as CompositeAddressValue) : null
  }, [composite, field.state.value, form])

  const value = currentCompositeValue

  const { processedError } = getFieldErrors(field.state.meta.errors)

  const searchResult = useAtomValue(searchAtom(debouncedSearchQuery))

  const locations = Result.match(searchResult, {
    onFailure: () => [] as Array<AddressLocation>,
    onInitial: () => [] as Array<AddressLocation>,
    onSuccess: (result) => result.value,
  })

  const options: Array<AddressComboboxItem & { location?: AddressLocation }> = pipe(
    locations,
    Array.map((location) => {
      const compositeValue: CompositeAddressValue = {
        city: location.city,
        countryCode: location.countrycode,
        latitude: location.coordinates.latitude,
        longitude: location.coordinates.longitude,
        state: location.state,
        street: pipe(
          [location.housenumber, location.street],
          Array.filterMap((part) => Option.fromNullable(part)),
          Array.join(' '),
        ),
        zip: location.postcode,
      }

      const { line1, line2 } = formatAddress(compositeValue)

      return {
        _tag: 'address' as const,
        id: location.id,
        line1,
        line2,
        location,
        name: location.name,
      }
    }),
  )

  const selectedOptions = pipe(
    value,
    Option.fromNullable,
    Option.match({
      onNone: () => [] as Array<AddressComboboxItem>,
      onSome: (compositeValue) => {
        const { line1, line2 } = formatAddress(compositeValue)

        return [
          {
            _tag: 'address' as const,
            id: 'current',
            line1,
            line2,
            name: line1 || 'Unknown Location',
          },
        ]
      },
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
            if (composite && composite.length > 0) {
              pipe(
                composite,
                Array.forEach((fieldName) => {
                  form.setFieldValue(fieldName, undefined)
                }),
              )
            } else {
              field.handleChange(null)
            }

            if (onLocationSelect) {
              onLocationSelect(null)
            }
          },
          onSome: (location) => {
            const compositeValue: CompositeAddressValue = {
              city: location.city,
              countryCode: location.country,
              latitude: location.coordinates.latitude,
              longitude: location.coordinates.longitude,
              state: location.state,
              street: pipe(
                [location.housenumber, location.street],
                Array.filterMap(Option.fromNullable),
                Array.join(' '),
              ),
              zip: location.postcode,
            }

            if (composite && composite.length > 0) {
              pipe(
                composite,
                Array.forEach((fieldName) => {
                  const value = compositeValue[fieldName as keyof CompositeAddressValue]
                  form.setFieldValue(fieldName, value)
                }),
              )
            } else {
              field.handleChange(compositeValue)
            }

            if (onLocationSelect) {
              onLocationSelect(location)
            }
          },
        }),
      )
    },
    [locations, field, onLocationSelect, composite, form],
  )

  const handleRemoveItem = useCallback(() => {
    if (composite && composite.length > 0) {
      pipe(
        composite,
        Array.forEach((fieldName) => {
          form.setFieldValue(fieldName, undefined)
        }),
      )
    } else {
      field.handleChange(null)
    }

    if (onLocationSelect) {
      onLocationSelect(null)
    }
  }, [field, onLocationSelect, composite, form])

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
      <Combobox<AddressComboboxItem>
        addItem={handleAddItem}
        alignOffset={alignOffset}
        ComboboxItem={AddressComboboxItemComponent}
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
