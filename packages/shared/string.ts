import { Array, pipe, Record } from 'effect'

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
      return word.slice(0, -1) + 'ies'
    }
  }

  // Words ending in s, x, z, ch, sh
  if (word.match(/[sxz]$|[cs]h$/)) {
    return word + 'es'
  }

  // Words ending in 'f' or 'fe'
  if (word.endsWith('f')) {
    return word.slice(0, -1) + 'ves'
  }
  if (word.endsWith('fe')) {
    return word.slice(0, -2) + 'ves'
  }

  // Words ending in 'o' preceded by consonant
  if (word.length > 1 && word.endsWith('o')) {
    const beforeO = word[word.length - 2] || ''
    if (!'aeiou'.includes(beforeO.toLowerCase())) {
      // Common exceptions that just add 's'
      const oExceptions = ['photo', 'piano', 'halo', 'solo', 'pro', 'auto']
      if (!oExceptions.includes(lower)) {
        return word + 'es'
      }
    }
  }

  // Default: add 's'
  return word + 's'
}

export function singularize(word: string): string {
  // Handle empty strings
  if (!word) return word

  const lower = word.toLowerCase()

  // Check for irregular singulars (case-insensitive)
  if (irregularSingulars[lower]) {
    return preserveCase(word, irregularSingulars[lower])
  }

  // Words ending in 'ies'
  if (word.endsWith('ies')) {
    return word.slice(0, -3) + 'y'
  }

  // Words ending in 'ves'
  if (word.endsWith('ves')) {
    return word.slice(0, -3) + 'f'
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
    return base + 'e'
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
  if (original.length === 0) return transformed

  // If original is all uppercase
  if (original === original.toUpperCase()) {
    return transformed.toUpperCase()
  }

  // If original starts with uppercase
  if (original[0] === original[0]?.toUpperCase()) {
    return transformed.charAt(0).toUpperCase() + transformed.slice(1).toLowerCase()
  }

  // Otherwise, return lowercase
  return transformed.toLowerCase()
}
