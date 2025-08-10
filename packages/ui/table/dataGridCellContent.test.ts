import { GridCellKind } from '@glideapps/glide-data-grid'
import { effect, expect } from '@openfaith/bun-test'
import { Effect } from 'effect'
import { getActionsCell, getGridCellContent, getRelationCell } from './dataGridCellContent'

effect('getGridCellContent handles null and undefined values', () =>
  Effect.gen(function* () {
    const field = { key: 'test', schema: {} }

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
    const field = { key: 'isActive', schema: {} }

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
    const field = { key: 'count', schema: {} }

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
    const field = { key: 'avatar', schema: {} }

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
    const field = { key: 'website', schema: {} }

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

    // Null relation
    const nullCell = getRelationCell(null)
    expect(nullCell.kind).toBe(GridCellKind.Text)
    if (nullCell.kind === GridCellKind.Text) {
      expect(nullCell.data).toBe('')
      expect(nullCell.displayData).toBe('')
    }

    // Array with items
    const populatedCell = getRelationCell([1, 2, 3])
    expect(populatedCell.kind).toBe(GridCellKind.Text)
    if (populatedCell.kind === GridCellKind.Text) {
      expect(populatedCell.data).toBe('3')
      expect(populatedCell.displayData).toBe('3 items')
    }

    // Empty array
    const emptyArrayCell = getRelationCell([])
    expect(emptyArrayCell.kind).toBe(GridCellKind.Text)
    if (emptyArrayCell.kind === GridCellKind.Text) {
      expect(emptyArrayCell.data).toBe('0')
      expect(emptyArrayCell.displayData).toBe('')
    }
  }),
)
