import { Array, flow, Match, Option, pipe, Record, String } from 'effect'

const irregularPlurals: Record<string, string> = {
  address: 'addresses',
  campus: 'campuses',
  child: 'children',
  person: 'people',
}

const irregularSingulars = pipe(
  irregularPlurals,
  Record.toEntries,
  Array.map(([a, b]) => [b, a] as const),
  Record.fromEntries,
)

export function pluralize(word: string): string {
  // Handle empty strings
  if (!word) return word

  const lower = word.toLowerCase()

  // Check for irregular plurals (case-insensitive)
  if (irregularPlurals[lower]) {
    return preserveCase(word, irregularPlurals[lower])
  }

  // Words ending in 'y' preceded by consonant
  if (word.length > 1 && word.endsWith('y')) {
    const beforeY = word[word.length - 2] || ''
    if (!'aeiou'.includes(beforeY.toLowerCase())) {
      return `${word.slice(0, -1)}ies`
    }
  }

  // Words ending in s, x, z, ch, sh
  if (word.match(/[sxz]$|[cs]h$/)) {
    return `${word}es`
  }

  // Words ending in 'f' or 'fe'
  if (word.endsWith('f')) {
    return `${word.slice(0, -1)}ves`
  }
  if (word.endsWith('fe')) {
    return `${word.slice(0, -2)}ves`
  }

  // Words ending in 'o' preceded by consonant
  if (word.length > 1 && word.endsWith('o')) {
    const beforeO = word[word.length - 2] || ''
    if (!'aeiou'.includes(beforeO.toLowerCase())) {
      // Common exceptions that just add 's'
      const oExceptions = ['photo', 'piano', 'halo', 'solo', 'pro', 'auto']
      if (!oExceptions.includes(lower)) {
        return `${word}es`
      }
    }
  }

  // Default: add 's'
  return `${word}s`
}

export function singularize(word: string): string {
  // Handle empty strings
  if (!word) return word

  const lower = word.toLowerCase()

  // Check for irregular singulars (case-insensitive)
  if (irregularSingulars[lower]) {
    return preserveCase(word, irregularSingulars[lower])
  }

  // Check if word is already a singular form from our irregular plurals
  // This prevents singularizing words that are already singular
  const singularValues = pipe(irregularPlurals, Record.values)
  if (pipe(singularValues, Array.contains(lower))) {
    return word
  }

  // Words ending in 'us' are typically already singular (Latin origin)
  // Common examples: campus, status, virus, focus, bonus, genus, etc.
  if (word.endsWith('us')) {
    return word
  }

  // Words ending in 'ies'
  if (word.endsWith('ies')) {
    return `${word.slice(0, -3)}y`
  }

  // Words ending in 'ves'
  if (word.endsWith('ves')) {
    return `${word.slice(0, -3)}f`
  }

  // Words ending in 'es'
  if (word.endsWith('es')) {
    const base = word.slice(0, -2)
    // Check if base ends in s, x, z, ch, sh
    if (base.match(/[sxz]$|[cs]h$/)) {
      return base
    }
    // Check if base ends in 'o' preceded by consonant
    if (base.length > 1 && base.endsWith('o')) {
      const beforeO = base[base.length - 2] || ''
      if (!'aeiou'.includes(beforeO.toLowerCase())) {
        return base
      }
    }
    // Otherwise, it might be a regular 'e' ending
    return `${base}e`
  }

  // Words ending in 's' (but not 'ss')
  if (word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1)
  }

  // If no plural pattern found, return as is
  return word
}

// Helper function to preserve the case pattern of the original word
function preserveCase(original: string, transformed: string): string {
  if (pipe(original, String.length) === 0) {
    return transformed
  }

  // If original is all uppercase
  if (original === pipe(original, String.toUpperCase)) {
    return pipe(transformed, String.toUpperCase)
  }

  // If original starts with uppercase
  const firstChar = pipe(
    original,
    String.charAt(0),
    Option.getOrElse(() => ''),
  )
  if (firstChar === pipe(firstChar, String.toUpperCase)) {
    return pipe(transformed, String.capitalize, String.toLowerCase, String.capitalize)
  }

  // Otherwise, return lowercase
  return pipe(transformed, String.toLowerCase)
}

/**
 * Converts table name to entity name (people -> Person, addresses -> Address)
 */
export const mkEntityName = flow(String.snakeToPascal, singularize)

/**
 * Converts entity name to table name (Person -> people, Address -> addresses)
 */
export const mkTableName = flow(String.pascalToSnake, pluralize)

/**
 * Converts entity name to Zero schema table name (Person -> people, PhoneNumber -> phoneNumbers)
 */
export const mkZeroTableName = flow(String.uncapitalize, pluralize)

/**
 * Converts table name to entity type for IDs (people -> person, phone_numbers -> phonenumber)
 */
export const mkEntityType = flow(String.snakeToPascal, String.toLowerCase, singularize)

/**
 * Converts entity name to standardized URL parameter name (Person -> personId, PhoneNumber -> phoneNumberId)
 */
export const mkUrlParamName = flow(String.uncapitalize, String.concat('Id'))

/**
 * Formats a field name into a human-readable label using Effect-TS String utilities
 * Handles snake_case, kebab-case, camelCase, PascalCase, and mixed formats
 * Examples:
 * - "first_name" -> "First Name"
 * - "firstName" -> "First Name"
 * - "FirstName" -> "First Name"
 * - "first-name" -> "First Name"
 * - "phoneNumber2" -> "Phone Number 2"
 */
export const formatLabel = (fieldName: string): string =>
  pipe(
    fieldName,
    Match.value,
    Match.when(String.isEmpty, () => ''),
    Match.when(String.includes(' '), (name) =>
      pipe(name, String.split(' '), Array.map(String.capitalize), Array.join(' ')),
    ),
    Match.when(String.includes('_'), (name) =>
      pipe(name, String.split('_'), Array.map(String.capitalize), Array.join(' ')),
    ),
    Match.when(String.includes('-'), (name) =>
      pipe(name, String.split('-'), Array.map(String.capitalize), Array.join(' ')),
    ),
    Match.orElse((name) =>
      pipe(
        name,
        // Convert camelCase/PascalCase to kebab-case with regex for numbers
        String.replace(/([a-z])([A-Z])/g, '$1-$2'),
        String.replace(/([a-z])(\d)/g, '$1-$2'),
        String.replace(/(\d)([A-Z])/g, '$1-$2'),
        String.toLowerCase,
        String.split('-'),
        Array.map(String.capitalize),
        Array.join(' '),
      ),
    ),
  )
