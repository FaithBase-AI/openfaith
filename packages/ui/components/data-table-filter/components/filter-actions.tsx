import type { DataTableFilterActions } from '@openfaith/ui/components/data-table-filter/core/types'
import { type Locale, t } from '@openfaith/ui/components/data-table-filter/lib/i18n'
import { Button } from '@openfaith/ui/components/ui/button'
import { FilterClearIcon } from '@openfaith/ui/icons/filterClearIcon'
import { cn } from '@openfaith/ui/shared/utils'
import { memo } from 'react'

interface FilterActionsProps {
  hasFilters: boolean
  actions?: DataTableFilterActions
  locale?: Locale
}

export const FilterActions = memo(__FilterActions)
function __FilterActions({ hasFilters, actions, locale = 'en' }: FilterActionsProps) {
  return (
    <Button
      className={cn('!px-2 h-10', !hasFilters && 'hidden')}
      onClick={actions?.removeAllFilters}
      variant='destructive'
    >
      <FilterClearIcon />
      <span className='hidden md:block'>{t('clear', locale)}</span>
    </Button>
  )
}
