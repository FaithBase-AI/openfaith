'use client'

import { cn } from '@openfaith/ui'
import { Link, useLocation } from '@tanstack/react-router'
import { pipe, String } from 'effect'
import type { FC } from 'react'

type RightNavProps = {}

export const RightNav: FC<RightNavProps> = () => {
  const location = useLocation()

  return (
    <div className='mr-3.5 hidden text-sm md:flex'>
      <Link
        className={cn(
          'text-inherit transition-colors hover:opacity-80',
          pipe(location.pathname, String.startsWith('/blog')) ? 'opacity-100' : 'opacity-80',
        )}
        to='/blog'
      >
        Blog
      </Link>
    </div>
  )
}
