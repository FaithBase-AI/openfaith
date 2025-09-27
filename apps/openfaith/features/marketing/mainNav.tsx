'use client'

import type { Session } from '@openfaith/openfaith/shared/auth/sessionInit'
import { nullOp } from '@openfaith/shared'
import { cn } from '@openfaith/ui'
import { Link, useLocation } from '@tanstack/react-router'
import { Option, pipe, String } from 'effect'
import { AnimatePresence, motion } from 'motion/react'
import type { FC } from 'react'

type MainNavProps = {
  session?: Session | undefined
}

export const MainNav: FC<MainNavProps> = (props) => {
  const { session } = props

  const location = useLocation()

  return (
    <div className='ml-4 hidden md:flex'>
      <AnimatePresence>
        <motion.nav
          animate={{ opacity: 1 }}
          className='flex items-center gap-4 text-sm xl:gap-6'
          initial={{ opacity: 0 }}
        >
          {pipe(
            session,
            Option.fromNullable,
            Option.flatMapNullable((x) => x.activeOrganizationId),
            Option.match({
              onNone: nullOp,
              onSome: () => (
                <Link
                  className={cn(
                    'text-inherit transition-colors hover:opacity-80',
                    pipe(location.pathname, String.startsWith('/directory/people'))
                      ? 'opacity-100'
                      : 'opacity-80',
                  )}
                  to='/directory/people'
                >
                  App
                </Link>
              ),
            }),
          )}
        </motion.nav>
      </AnimatePresence>
    </div>
  )
}
