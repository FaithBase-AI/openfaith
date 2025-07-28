'use client'

import { debounce } from '@openfaith/ui/components/data-table-filter/lib/debounce'
import { Input } from '@openfaith/ui/components/ui/input'
import { useCallback, useEffect, useState } from 'react'

export function DebouncedInput({
  value: initialValue,
  onChange,
  debounceMs = 500, // This is the wait time, not the function
  ...props
}: {
  value?: string | number | undefined
  onChange: (value: string | number) => void
  debounceMs?: number
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'>) {
  const [value, setValue] = useState(initialValue)

  // Sync with initialValue when it changes
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  // Define the debounced function with useCallback
  // eslint-disable-next-line react-compiler/react-compiler
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedOnChange = useCallback(
    debounce((newValue: string | number) => {
      onChange(newValue)
    }, debounceMs), // Pass the wait time here
    [], // Dependencies
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue) // Update local state immediately
    debouncedOnChange(newValue) // Call debounced version
  }

  return <Input {...props} onChange={handleChange} value={value} />
}
