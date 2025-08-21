import { ComboboxField } from '@openfaith/ui/components/form/comboboxField'
import { DatePickerField } from '@openfaith/ui/components/form/datePickerField'
import { DateTimeField } from '@openfaith/ui/components/form/dateTimeField'
import { InputField, SlugInputField } from '@openfaith/ui/components/form/inputField'
import { OTPField } from '@openfaith/ui/components/form/otpField'
import { SelectField } from '@openfaith/ui/components/form/selectField'
import { SelectSchemaField } from '@openfaith/ui/components/form/selectSchemaField'
import { SingleComboboxField } from '@openfaith/ui/components/form/singleComboboxField'
import { SwitchField } from '@openfaith/ui/components/form/switchField'
import { TagInputField } from '@openfaith/ui/components/form/tagInputField'
import { TextareaField } from '@openfaith/ui/components/form/textareaField'
import { fieldContext, formContext } from '@openfaith/ui/components/form/tsField'
import { createFormHook } from '@tanstack/react-form'

export const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    ComboboxField,
    DatePickerField,
    DateTimeField,
    InputField,
    OTPField,
    SelectField,
    SelectSchemaField,
    SingleComboboxField,
    SlugInputField,
    SwitchField,
    TagInputField,
    TextareaField,
  },
  fieldContext,
  formComponents: {},
  formContext,
})
