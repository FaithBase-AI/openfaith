import { describe, expect, test } from 'bun:test'
import { PcoAdapterLayer, PcoAdapterOperationsLayer } from '@openfaith/pco/pcoAdapterLayer'

describe('PcoAdapterLayer', () => {
  test('should be properly defined', () => {
    expect(PcoAdapterLayer).toBeDefined()
    expect(typeof PcoAdapterLayer).toBe('object')
  })

  test('should have the correct layer structure', () => {
    // Test that the layer has the expected properties
    expect(PcoAdapterLayer).toHaveProperty('pipe')
    expect(typeof PcoAdapterLayer.pipe).toBe('function')
  })
})

describe('PcoAdapterOperationsLayer', () => {
  test('should be properly defined', () => {
    expect(PcoAdapterOperationsLayer).toBeDefined()
    expect(typeof PcoAdapterOperationsLayer).toBe('object')
  })

  test('should have the correct layer structure', () => {
    // Test that the layer has the expected properties
    expect(PcoAdapterOperationsLayer).toHaveProperty('pipe')
    expect(typeof PcoAdapterOperationsLayer.pipe).toBe('function')
  })

  test('should be composable with other layers', () => {
    // Test that the layer can be composed
    const composedLayer = PcoAdapterOperationsLayer.pipe((layer) => layer)
    expect(composedLayer).toBeDefined()
  })
})

describe('Layer exports', () => {
  test('should export both adapter layers', () => {
    expect(PcoAdapterLayer).toBeDefined()
    expect(PcoAdapterOperationsLayer).toBeDefined()
  })

  test('layers should be different objects', () => {
    expect(PcoAdapterLayer).not.toBe(PcoAdapterOperationsLayer)
  })
})
