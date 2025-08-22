import { createFormHookContexts } from '@tanstack/react-form'

// Create and export contexts for use in custom components
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()
