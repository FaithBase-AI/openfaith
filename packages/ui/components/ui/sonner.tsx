'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps, toast } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      className='toaster group'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-border': 'var(--border)',
          '--normal-text': 'var(--popover-foreground)',
        } as React.CSSProperties
      }
      theme={resolvedTheme as 'light' | 'dark' | 'system'}
      {...props}
    />
  )
}

export { Toaster, toast }
