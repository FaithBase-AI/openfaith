import { ComboboxField } from '@openfaith/ui/components/formFields/comboboxField'
import { DatePickerField } from '@openfaith/ui/components/formFields/datePickerField'
import { DateTimeField } from '@openfaith/ui/components/formFields/dateTimeField'
import { InputField, SlugInputField } from '@openfaith/ui/components/formFields/inputField'
import { OTPField } from '@openfaith/ui/components/formFields/otpField'
import { SelectField } from '@openfaith/ui/components/formFields/selectField'
import { SingleComboboxField } from '@openfaith/ui/components/formFields/singleComboboxField'
import { SwitchField } from '@openfaith/ui/components/formFields/switchField'
import { TagInputField } from '@openfaith/ui/components/formFields/tagInputField'
import { TextareaField } from '@openfaith/ui/components/formFields/textareaField'
import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

// Create and export contexts for use in custom components
export const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

// Create and export the form hook with base configuration
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  // We'll add field components as we convert them
  fieldComponents: {
    ComboboxField,
    DatePickerField,
    DateTimeField,
    InputField,
    OTPField,
    SelectField,
    SingleComboboxField,
    SlugInputField,
    SwitchField,
    TagInputField,
    TextareaField,
  },
  // We'll add form components as we need them
  formComponents: {},
})
