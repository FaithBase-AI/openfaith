export interface BaseComboboxItem {
  _tag: string
  id: string
  avatar?: string | null
  name: string | null
}

// For some reason these props need to be optional for ts to pass.
export interface ByLineComboboxItem extends BaseComboboxItem {
  byLine?: string
}
