'use client'

import {
  isLgScreenAtom,
  isMdScreenAtom,
  isSmScreenAtom,
  isXlScreenAtom,
} from '@openfaith/ui/shared/globalState'
import { useMediaQuery } from '@openfaith/ui/shared/hooks/useMediaQuery'
import { useAtom } from 'jotai'
import type { FC } from 'react'
import { useEffect } from 'react'

export const GlobalMediaQueries: FC = () => {
  const [, setIsSmScreen] = useAtom(isSmScreenAtom)
  const [, setIsMdScreen] = useAtom(isMdScreenAtom)
  const [, setIsLgScreen] = useAtom(isLgScreenAtom)
  const [, setIsXlScreen] = useAtom(isXlScreenAtom)

  const isSmScreenQuery = useMediaQuery('(width < 640px)')
  const isMdScreenQuery = useMediaQuery('(width >= 768px)')
  const isLgScreenQuery = useMediaQuery('(width >= 1024px)')
  const isXlScreenQuery = useMediaQuery('(width >= 1280px)')

  useEffect(() => {
    setIsSmScreen(isSmScreenQuery)
  }, [isSmScreenQuery, setIsSmScreen])

  useEffect(() => {
    setIsMdScreen(isMdScreenQuery)
  }, [isMdScreenQuery, setIsMdScreen])

  useEffect(() => {
    setIsLgScreen(isLgScreenQuery)
  }, [isLgScreenQuery, setIsLgScreen])

  useEffect(() => {
    setIsXlScreen(isXlScreenQuery)
  }, [isXlScreenQuery, setIsXlScreen])

  return null
}
