import type { ReactNode } from 'react'

export type CommandMenuType = {
  icon: ReactNode
  name: string
  shortcut?: string
  onSelect: () => void | Promise<void>
}
