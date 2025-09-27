import { cn } from '@openfaith/ui'
import { Link, type LinkComponentProps, useLocation } from '@tanstack/react-router'
import { pipe, String } from 'effect'
import type { FC } from 'react'

type NavLinkProps = LinkComponentProps & {}

export const NavLink: FC<NavLinkProps> = (props) => {
  const { to = '/', className, children, ...domProps } = props

  const location = useLocation()

  return (
    <Link
      className={cn(
        'text-inherit transition-colors hover:opacity-80',
        pipe(location.pathname, String.startsWith(to)) ? 'opacity-100' : 'opacity-80',
        className,
      )}
      to={to}
      {...domProps}
    >
      {children}
    </Link>
  )
}
