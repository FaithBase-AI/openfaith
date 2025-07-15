'use client'

import { Button, type ButtonProps } from '@openfaith/ui/components/ui/button'
import { MoonIcon } from '@openfaith/ui/icons/moonIcon'
import { SunIcon } from '@openfaith/ui/icons/sunIcon'
import { Boolean, pipe } from 'effect'
import { useTheme } from 'next-themes'
import { type FC, useEffect } from 'react'

export const ThemeToggle: FC<ButtonProps> = (props) => {
  const { setTheme, theme } = useTheme()

  useEffect(() => {
    if (typeof window !== 'undefined' && document.querySelector('meta[name="theme-color"]')) {
      if (theme === 'dark') {
        document.querySelector('meta[name="theme-color"]')!.setAttribute('content', '#000000')
      } else {
        document.querySelector('meta[name="theme-color"]')!.setAttribute('content', '#ffffff')
      }
    }
  }, [theme])

  return (
    <Button
      onClick={() => {
        pipe(
          theme === 'dark',
          Boolean.match({
            onFalse: () => setTheme('dark'),
            onTrue: () => setTheme('light'),
          }),
        )
      }}
      size={'icon'}
      variant={'ghost'}
      {...props}
    >
      <SunIcon
        className={
          'dark:-rotate-90 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:scale-0'
        }
      />
      <MoonIcon
        className={
          'absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100'
        }
      />
      <span className={'sr-only'}>Toggle theme</span>
    </Button>
  )
}
