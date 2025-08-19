import { expect } from 'bun:test'
import { effect } from '@openfaith/bun-test'
import { getCellRenderer } from '@openfaith/ui/table/cellRenderers'
import { Effect } from 'effect'
import React from 'react'

// Mock cell context for testing
const createMockCellContext = (value: any, row: any = {}) => ({
  getValue: () => value,
  row: { original: row },
})

// Type guard for React elements with specific props
const isReactElementWithProps = (element: any): element is React.ReactElement<any> => {
  return React.isValidElement(element)
}

effect('getCellRenderer returns function for unknown cell type (falls back to default)', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('unknown')
    expect(renderer).toBeDefined()
    expect(typeof renderer).toBe('function')

    // Should return string representation for unknown types
    const result = renderer?.(createMockCellContext('test'))
    expect(result).toBe('test')
  }),
)

effect('getCellRenderer returns undefined when no cell type provided', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer()
    expect(renderer).toBeUndefined()
  }),
)

effect('text cell renderer returns string value', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('text')
    expect(renderer).toBeDefined()

    const result = renderer?.(createMockCellContext('Hello World'))
    expect(result).toBe('Hello World')
  }),
)

effect('text cell renderer handles null/undefined values', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('text')

    const nullResult = renderer?.(createMockCellContext(null))
    expect(nullResult).toBe('')

    const undefinedResult = renderer?.(createMockCellContext(undefined))
    expect(undefinedResult).toBe('')
  }),
)

effect('email cell renderer creates mailto link', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('email')
    const result = renderer?.(createMockCellContext('test@example.com'))

    // Check that it's a React element with correct props
    expect(React.isValidElement(result)).toBe(true)
    if (isReactElementWithProps(result)) {
      expect(result.type).toBe('a')
      expect((result.props as any).href).toBe('mailto:test@example.com')
      expect((result.props as any).children).toBe('test@example.com')
      expect((result.props as any).className).toContain('text-blue-600')
    }
  }),
)

effect('email cell renderer handles empty values', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('email')

    const nullResult = renderer?.(createMockCellContext(null))
    expect(nullResult).toBe('')

    const emptyResult = renderer?.(createMockCellContext(''))
    expect(emptyResult).toBe('')
  }),
)

effect('number cell renderer formats numbers with locale', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('number')

    const result = renderer?.(createMockCellContext(1234567))
    expect(result).toBe('1,234,567')

    const nullResult = renderer?.(createMockCellContext(null))
    expect(nullResult).toBe('')
  }),
)

effect('currency cell renderer formats as USD currency', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('currency')

    const result = renderer?.(createMockCellContext(1234.56))
    expect(result).toBe('$1,234.56')

    const nullResult = renderer?.(createMockCellContext(null))
    expect(nullResult).toBe('')
  }),
)

effect('boolean cell renderer creates badge with correct styling', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('boolean')

    const trueResult = renderer?.(createMockCellContext(true))
    expect(React.isValidElement(trueResult)).toBe(true)
    if (isReactElementWithProps(trueResult)) {
      expect(trueResult.type).toBe('span')
      expect((trueResult.props as any).className).toContain('bg-green-100')
      expect((trueResult.props as any).children).toBe('Yes')
    }

    const falseResult = renderer?.(createMockCellContext(false))
    expect(React.isValidElement(falseResult)).toBe(true)
    if (isReactElementWithProps(falseResult)) {
      expect((falseResult.props as any).className).toContain('bg-gray-100')
      expect((falseResult.props as any).children).toBe('No')
    }
  }),
)

effect('date cell renderer formats date correctly', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('date')

    const testDate = '2023-12-25T10:30:00Z'
    const result = renderer?.(createMockCellContext(testDate))

    // Should be a formatted date string
    expect(typeof result).toBe('string')
    expect(result).toContain('12/25/2023')

    const emptyResult = renderer?.(createMockCellContext(''))
    expect(emptyResult).toBe('')
  }),
)

effect('datetime cell renderer formats datetime correctly', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('datetime')

    const testDate = '2023-12-25T10:30:00Z'
    const result = renderer?.(createMockCellContext(testDate))

    // Should be a formatted datetime string
    expect(typeof result).toBe('string')
    expect(result).toContain('12/25/2023')
    expect(result).toContain('10:30')

    const emptyResult = renderer?.(createMockCellContext(''))
    expect(emptyResult).toBe('')
  }),
)

effect('badge cell renderer creates styled badge', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('badge')

    const result = renderer?.(createMockCellContext('Active'))
    expect(React.isValidElement(result)).toBe(true)
    if (isReactElementWithProps(result)) {
      expect(result.type).toBe('span')
      expect((result.props as any).className).toContain('bg-blue-100')
      expect((result.props as any).children).toBe('Active')
    }

    const emptyResult = renderer?.(createMockCellContext(''))
    expect(emptyResult).toBe('')
  }),
)

effect('link cell renderer creates external link', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('link')

    const result = renderer?.(createMockCellContext('https://example.com'))
    expect(React.isValidElement(result)).toBe(true)
    if (isReactElementWithProps(result)) {
      expect(result.type).toBe('a')
      expect((result.props as any).href).toBe('https://example.com')
      expect((result.props as any).target).toBe('_blank')
      expect((result.props as any).rel).toBe('noopener noreferrer')
      expect((result.props as any).children).toBe('https://example.com')
    }

    const emptyResult = renderer?.(createMockCellContext(''))
    expect(emptyResult).toBe('')
  }),
)

effect('avatar cell renderer creates image with fallback', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('avatar')

    const mockRow = { firstName: 'John', lastName: 'Doe' }
    const result = renderer?.(createMockCellContext('https://example.com/avatar.jpg', mockRow))

    expect(React.isValidElement(result)).toBe(true)
    if (isReactElementWithProps(result)) {
      expect(result.type).toBe('img')
      expect((result.props as any).src).toBe('https://example.com/avatar.jpg')
      expect((result.props as any).alt).toBe('John Doe')
      expect((result.props as any).className).toContain('h-8 w-8 rounded-full')
    }
  }),
)

effect('avatar cell renderer creates initials fallback when no image', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('avatar')

    const mockRow = { firstName: 'John', lastName: 'Doe' }
    const result = renderer?.(createMockCellContext(null, mockRow))

    expect(React.isValidElement(result)).toBe(true)
    if (isReactElementWithProps(result)) {
      expect(result.type).toBe('div')
      expect((result.props as any).className).toBe(
        'flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 font-medium text-gray-700 text-xs',
      )
      expect((result.props as any).children).toBe('JD')
    }
  }),
)

effect('avatar cell renderer handles missing name gracefully', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('avatar')

    const mockRow = {}
    const result = renderer?.(createMockCellContext(null, mockRow))

    expect(React.isValidElement(result)).toBe(true)
    if (isReactElementWithProps(result)) {
      expect((result.props as any).children).toBe('U') // "Unknown" -> "U"
    }
  }),
)

effect('avatar cell renderer handles single name', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('avatar')

    const mockRow = { name: 'John' }
    const result = renderer?.(createMockCellContext(null, mockRow))

    expect(React.isValidElement(result)).toBe(true)
    if (isReactElementWithProps(result)) {
      expect((result.props as any).children).toBe('J')
    }
  }),
)

effect('default case returns string representation', () =>
  Effect.gen(function* () {
    const renderer = getCellRenderer('unknown-type' as any)

    const result = renderer?.(createMockCellContext(42))
    expect(result).toBe('42')

    const nullResult = renderer?.(createMockCellContext(null))
    expect(nullResult).toBe('')
  }),
)
