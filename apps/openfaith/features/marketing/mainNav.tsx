'use client'

import { NavLink } from '@openfaith/openfaith/features/marketing/navLink'
import { AnimatePresence, motion } from 'motion/react'
import type { FC } from 'react'

type MainNavProps = {}

export const MainNav: FC<MainNavProps> = () => {
  return (
    <div className='ml-4 hidden md:flex'>
      <AnimatePresence>
        <motion.nav
          animate={{ opacity: 1 }}
          className='flex items-center gap-4 text-sm xl:gap-6'
          initial={{ opacity: 0 }}
        >
          <NavLink to='/features'>Features</NavLink>
          <NavLink to='/integrations'>Integrations</NavLink>
          <NavLink to='/pricing'>Pricing</NavLink>
          <NavLink to='/vision'>Vision</NavLink>
          <NavLink to='/blog'>Blog</NavLink>
        </motion.nav>
      </AnimatePresence>
    </div>
  )
}
