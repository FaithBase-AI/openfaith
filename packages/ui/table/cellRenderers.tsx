import { EntityLinkCell } from '@openfaith/ui/table/entityLinkCell'
import { Array, Option, pipe, String } from 'effect'

/**
 * Gets the appropriate cell renderer for a given cell type
 */
export const getCellRenderer = (cellType?: string, entityType?: string) => {
  return ({ getValue, row }: any) => {
    const value = getValue()

    switch (cellType) {
      case 'text':
        return renderTextCell(value)

      case 'content':
      case 'description':
        return renderContentCell(value)

      case 'email':
        return renderEmailCell(value)

      case 'number':
        return renderNumberCell(value)

      case 'currency':
        return renderCurrencyCell(value)

      case 'boolean':
        return renderBooleanCell(value)

      case 'date':
        return renderDateCell(value)

      case 'datetime':
        return renderDateTimeCell(value)

      case 'badge':
        return renderBadgeCell(value)

      case 'link':
        return renderLinkCell(value)

      case 'avatar':
        return renderAvatarCell(value, row.original)

      case 'entityLink':
        return renderEntityLinkCell(value, row.original, entityType)

      default:
        // Default text renderer for fields without specific cellType
        return renderTextCell(value)
    }
  }
}

/**
 * Renders a simple text cell with proper styling for multi-line content
 */
const renderTextCell = (value: any) => {
  const content = pipe(value || '', (v) => `${v}`)
  return <div className='whitespace-pre-wrap text-sm'>{content}</div>
}

/**
 * Renders a content/description cell with proper styling for multi-line content
 */
const renderContentCell = (value: any) => {
  const content = pipe(value || '', (v) => `${v}`)
  return <div className='whitespace-pre-wrap text-sm'>{content}</div>
}

/**
 * Renders an email cell with mailto link
 */
const renderEmailCell = (value: string) => {
  if (!value) {
    return ''
  }
  return (
    <a
      className='text-blue-600 hover:underline'
      href={`mailto:${value}`}
      onClick={(e) => e.stopPropagation()}
    >
      {value}
    </a>
  )
}

/**
 * Renders a number cell with locale formatting
 */
const renderNumberCell = (value: number) => {
  if (value == null) {
    return ''
  }
  return value.toLocaleString()
}

/**
 * Renders a currency cell with USD formatting
 */
const renderCurrencyCell = (value: number) => {
  if (value == null) {
    return ''
  }
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    style: 'currency',
  }).format(value)
}

/**
 * Renders a boolean cell with Yes/No badge
 */
const renderBooleanCell = (value: boolean) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
        value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}
    >
      {value ? 'Yes' : 'No'}
    </span>
  )
}

/**
 * Renders a date cell with locale formatting
 */
const renderDateCell = (value: string | number) => {
  if (!value) {
    return ''
  }

  // Handle numeric timestamps (convert string numbers to actual numbers)
  const numericValue = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value

  const date = new Date(numericValue)
  return date.toLocaleDateString()
}

/**
 * Renders a datetime cell with locale formatting
 */
const renderDateTimeCell = (value: string | number) => {
  if (!value) {
    return ''
  }

  // Handle numeric timestamps (convert string numbers to actual numbers)
  const numericValue = typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value

  const date = new Date(numericValue)
  return date.toLocaleString()
}

/**
 * Renders a badge cell
 */
const renderBadgeCell = (value: string | boolean) => {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  // Handle boolean values
  if (typeof value === 'boolean') {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-medium text-xs ${
          value ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}
      >
        {value ? 'Yes' : 'No'}
      </span>
    )
  }

  // Handle string values
  return (
    <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 font-medium text-blue-800 text-xs'>
      {value}
    </span>
  )
}

/**
 * Renders a link cell
 */
const renderLinkCell = (value: string) => {
  if (!value) {
    return ''
  }
  return (
    <a
      className='text-blue-600 hover:underline'
      href={value}
      onClick={(e) => e.stopPropagation()}
      rel='noopener noreferrer'
      target='_blank'
    >
      {value}
    </a>
  )
}

/**
 * Renders an avatar cell with fallback to initials
 */
const renderAvatarCell = (value: string, row: any) => {
  const name =
    row.firstName && row.lastName ? `${row.firstName} ${row.lastName}` : row.name || 'Unknown'

  const initials = pipe(
    name,
    String.split(' '),
    Array.map((n) =>
      pipe(
        n,
        String.charAt(0),
        Option.getOrElse(() => ''),
      ),
    ),
    Array.join(''),
    String.toUpperCase,
  )

  if (value) {
    return (
      <img
        alt={name}
        className='h-8 w-8 rounded-full object-cover'
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          const fallback = target.nextElementSibling as HTMLElement
          if (fallback) {
            fallback.style.display = 'flex'
          }
        }}
        src={value}
      />
    )
  }

  return (
    <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 font-medium text-gray-700 text-xs'>
      {initials}
    </div>
  )
}

/**
 * Renders an entity link cell that opens the details pane
 */
const renderEntityLinkCell = (value: string, row: any, entityType?: string) => {
  if (!value || !entityType || !row.id) {
    return renderTextCell(value)
  }

  return <EntityLinkCell entityId={row.id} entityType={entityType} value={value} />
}
