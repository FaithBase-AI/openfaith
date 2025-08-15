import type { CustomCell, Rectangle, Theme } from '@glideapps/glide-data-grid'
import { GridCellKind } from '@glideapps/glide-data-grid'
import { formatLabel } from '@openfaith/shared'
import { Array, Option, pipe, Record } from 'effect'

// Define custom cell data structure for entity badges
export interface EntityBadgesCellData {
  kind: 'entity-badges-cell'
  entityIds: ReadonlyArray<string>
  entityType: string
  entityNames?: Record<string, string> // Map of ID to display name
}

// Type for the entity badges custom cell
export interface EntityBadgesCell extends Omit<CustomCell, 'data'> {
  readonly kind: GridCellKind.Custom
  readonly data: EntityBadgesCellData
  readonly copyData: string
  readonly allowOverlay: false
}

// Helper to create an entity badges cell
export const createEntityBadgesCell = (
  entityIds: ReadonlyArray<string>,
  entityType: string,
  entityNames?: Record<string, string>,
): EntityBadgesCell => {
  // Create display text for copy using Effect Array utilities
  const copyText = pipe(
    entityIds,
    Array.map((id) =>
      pipe(
        Option.fromNullable(entityNames),
        Option.flatMap((names) => pipe(names, Record.get(id))),
        Option.getOrElse(() => id),
      ),
    ),
    Array.join(', '),
  )

  return {
    allowOverlay: false,
    copyData: copyText,
    data: {
      entityIds,
      entityNames,
      entityType,
      kind: 'entity-badges-cell',
    },
    kind: GridCellKind.Custom,
  }
}

// Custom cell renderer for entity badges
export const EntityBadgesCellRenderer = {
  draw: (
    args: {
      ctx: CanvasRenderingContext2D
      theme: Theme
      rect: Rectangle
      hoverAmount: number
      hoverX: number | undefined
      hoverY: number | undefined
      col: number
      row: number
      highlighted: boolean
    },
    cell: EntityBadgesCell,
  ): boolean => {
    const { ctx, theme, rect } = args
    const { entityIds, entityType, entityNames } = cell.data

    if (entityIds.length === 0) {
      // Draw empty state
      ctx.fillStyle = theme.textLight
      ctx.font = theme.baseFontStyle
      ctx.fillText(`No ${formatLabel(entityType)}s`, rect.x + 8, rect.y + rect.height / 2 + 4)
      return true
    }

    // Configure badge styling
    const badgeHeight = 24
    const badgePadding = 8
    const badgeSpacing = 4
    const badgeRadius = 4

    let xOffset = rect.x + 8
    const yOffset = rect.y + (rect.height - badgeHeight) / 2
    let drawnCount = 0

    // Draw badges that fit in the available space
    pipe(
      entityIds,
      Array.forEach((entityId) => {
        const displayName = pipe(
          Option.fromNullable(entityNames),
          Option.flatMap((names) => pipe(names, Record.get(entityId))),
          Option.getOrElse(() => entityId),
        )

        // Measure text
        ctx.font = '12px Inter, sans-serif'
        const textWidth = ctx.measureText(displayName).width
        const badgeWidth = textWidth + badgePadding * 2

        // Check if badge fits
        if (xOffset + badgeWidth > rect.x + rect.width - 8) {
          // Draw overflow indicator if there are more items
          const remaining = entityIds.length - drawnCount
          if (remaining > 0) {
            ctx.fillStyle = theme.textMedium
            ctx.font = '11px Inter, sans-serif'
            ctx.fillText(`+${remaining}`, xOffset, yOffset + badgeHeight / 2 + 3)
          }
          return false // Stop drawing more badges
        }

        // Draw badge background
        ctx.fillStyle = theme.bgBubble
        ctx.beginPath()
        ctx.roundRect(xOffset, yOffset, badgeWidth, badgeHeight, badgeRadius)
        ctx.fill()

        // Draw badge border
        ctx.strokeStyle = theme.borderColor
        ctx.lineWidth = 1
        ctx.stroke()

        // Draw badge text
        ctx.fillStyle = theme.textDark
        ctx.font = '12px Inter, sans-serif'
        ctx.fillText(displayName, xOffset + badgePadding, yOffset + badgeHeight / 2 + 4)

        xOffset += badgeWidth + badgeSpacing
        drawnCount++
        return true
      }),
    )

    return true
  },
  isMatch: (cell: CustomCell): cell is EntityBadgesCell => {
    return (cell.data as any)?.kind === 'entity-badges-cell'
  },

  provideEditor: () => undefined, // No editing for badges
}
