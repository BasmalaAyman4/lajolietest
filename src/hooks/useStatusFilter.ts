import { useState, useCallback } from 'react'

export type FilterValue = '' | 'true' | 'false'

export function useStatusFilter(initial: FilterValue = '') {
  const [value, setValue] = useState<FilterValue>(initial)

  const reset = useCallback(() => setValue(''), [])

  return { value, setValue, reset }
}