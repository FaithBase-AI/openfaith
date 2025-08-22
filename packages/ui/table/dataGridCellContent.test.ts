import { expect } from 'bun:test'
import { GridCellKind } from '@glideapps/glide-data-grid'
import { effect } from '@openfaith/bun-test'
import { Effect, Schema } from 'effect'
import { getActionsCell, getGridCellContent, getRelationCell } from './dataGridCellContent'

effect('getGridCellContent handles null and undefined values', () =>
  Effect.gen(function* () {
    // Create a minimal field object with a PropertySignature schema
    const field = {
      key: 'test',
      schema: Schema.String.ast,
    }

    const nullCell = getGridCellContent(field, null)
    expect(nullCell.kind).toBe(GridCellKind.Text)
    if (nullCell.kind === GridCellKind.Text) {
      expect(nullCell.data).toBe('')
      expect(nullCell.displayData).toBe('')
    }

    const undefinedCell = getGridCellContent(field, undefined)
    expect(undefinedCell.kind).toBe(GridCellKind.Text)
    if (undefinedCell.kind === GridCellKind.Text) {
      expect(undefinedCell.data).toBe('')
      expect(undefinedCell.displayData).toBe('')
    }
  }),
)

effect('getGridCellContent handles boolean values', () =>
  Effect.gen(function* () {
    const field = {
      key: 'isActive',
      schema: Schema.Boolean.ast,
    }

    const trueCell = getGridCellContent(field, true)
    expect(trueCell.kind).toBe(GridCellKind.Boolean)
    if (trueCell.kind === GridCellKind.Boolean) {
      expect(trueCell.data).toBe(true)
    }

    const falseCell = getGridCellContent(field, false)
    expect(falseCell.kind).toBe(GridCellKind.Boolean)
    if (falseCell.kind === GridCellKind.Boolean) {
      expect(falseCell.data).toBe(false)
    }
  }),
)

effect('getGridCellContent handles number values', () =>
  Effect.gen(function* () {
    const field = {
      key: 'count',
      schema: Schema.Number.ast,
    }

    const numberCell = getGridCellContent(field, 42)
    expect(numberCell.kind).toBe(GridCellKind.Number)
    if (numberCell.kind === GridCellKind.Number) {
      expect(numberCell.data).toBe(42)
      expect(numberCell.displayData).toBe('42')
    }
  }),
)

effect('getGridCellContent handles avatar/image values', () =>
  Effect.gen(function* () {
    const field = {
      key: 'avatar',
      schema: Schema.String.ast,
    }

    const imageUrl = 'https://example.com/avatar.jpg'
    const avatarCell = getGridCellContent(field, imageUrl)
    expect(avatarCell.kind).toBe(GridCellKind.Image)
    if (avatarCell.kind === GridCellKind.Image) {
      expect(avatarCell.data).toEqual([imageUrl])
      expect(avatarCell.rounding).toBe(9999)
    }
  }),
)

effect('getGridCellContent handles link/email values', () =>
  Effect.gen(function* () {
    const field = {
      key: 'website',
      schema: Schema.String.ast,
    }

    const linkCell = getGridCellContent(field, 'https://example.com')
    expect(linkCell.kind).toBe(GridCellKind.Uri)
    if (linkCell.kind === GridCellKind.Uri) {
      expect(linkCell.data).toBe('https://example.com')
    }
  }),
)

effect('getActionsCell creates actions cell', () =>
  Effect.gen(function* () {
    const actionsCell = getActionsCell()
    expect(actionsCell.kind).toBe(GridCellKind.Text)
    if (actionsCell.kind === GridCellKind.Text) {
      expect(actionsCell.displayData).toBe('⋮')
      expect(actionsCell.allowOverlay).toBe(false)
    }
  }),
)

effect('getRelationCell handles empty and populated relation data', () =>
  Effect.gen(function* () {
    // Empty relation
    const emptyCell = getRelationCell()
    expect(emptyCell.kind).toBe(GridCellKind.Text)
    if (emptyCell.kind === GridCellKind.Text) {
      expect(emptyCell.data).toBe('')
      expect(emptyCell.displayData).toBe('')
    }

    // Undefined relation
    const undefinedCell = getRelationCell(undefined)
    expect(undefinedCell.kind).toBe(GridCellKind.Text)
    if (undefinedCell.kind === GridCellKind.Text) {
      expect(undefinedCell.data).toBe('')
      expect(undefinedCell.displayData).toBe('')
    }

    // Array with string IDs
    const populatedCell = getRelationCell(['id1', 'id2', 'id3'])
    expect(populatedCell.kind).toBe(GridCellKind.Bubble)
    if (populatedCell.kind === GridCellKind.Bubble) {
      expect(populatedCell.data).toEqual(['id1', 'id2', 'id3'])
    }

    // Empty array
    const emptyArrayCell = getRelationCell([])
    expect(emptyArrayCell.kind).toBe(GridCellKind.Text)
    if (emptyArrayCell.kind === GridCellKind.Text) {
      expect(emptyArrayCell.data).toBe('')
      expect(emptyArrayCell.displayData).toBe('')
    }

    // Array with all items shown
    const manyItemsCell = getRelationCell(['id1', 'id2', 'id3', 'id4', 'id5'])
    expect(manyItemsCell.kind).toBe(GridCellKind.Bubble)
    if (manyItemsCell.kind === GridCellKind.Bubble) {
      expect(manyItemsCell.data).toEqual(['id1', 'id2', 'id3', 'id4', 'id5'])
    }

    // Array with entity names provided
    const withNamesCell = getRelationCell(['id1', 'id2', 'id3'], {
      id1: 'John Doe',
      id2: 'Jane Smith',
      id3: 'Bob Johnson',
    })
    expect(withNamesCell.kind).toBe(GridCellKind.Bubble)
    if (withNamesCell.kind === GridCellKind.Bubble) {
      expect(withNamesCell.data).toEqual(['John Doe', 'Jane Smith', 'Bob Johnson'])
    }
  }),
)
