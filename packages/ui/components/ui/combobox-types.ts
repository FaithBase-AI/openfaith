export interface BaseComboboxItem {
  _tag: string
  id: string
  avatar?: string | null
  name: string | null
}

// For some reason these props need to be optional for ts to pass.
export interface AddressComboboxItem extends BaseComboboxItem {
  line1?: string
  line2?: string
}
