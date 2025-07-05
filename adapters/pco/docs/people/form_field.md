Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](form_field.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)

2025-03-20

Info

[Address](address.md)

[App](app.md)

[BackgroundCheck](background_check.md)

[BirthdayPeople](birthday_people.md)

[Campus](campus.md)

[Carrier](carrier.md)

[Condition](condition.md)

[ConnectedPerson](connected_person.md)

[CustomSender](custom_sender.md)

[Email](email.md)

[FieldDatum](field_datum.md)

[FieldDefinition](field_definition.md)

[FieldOption](field_option.md)

[Form](form.md)

[FormCategory](form_category.md)

[FormField](form_field.md)

[FormFieldOption](form_field_option.md)

[FormSubmission](form_submission.md)

[FormSubmissionValue](form_submission_value.md)

[Household](household.md)

[HouseholdMembership](household_membership.md)

[InactiveReason](inactive_reason.md)

[List](list.md)

[ListCategory](list_category.md)

[ListResult](list_result.md)

[ListShare](list_share.md)

[ListStar](list_star.md)

[MailchimpSyncStatus](mailchimp_sync_status.md)

[MaritalStatus](marital_status.md)

[Message](message.md)

[MessageGroup](message_group.md)

[NamePrefix](name_prefix.md)

[NameSuffix](name_suffix.md)

[Note](note.md)

[NoteCategory](note_category.md)

[NoteCategoryShare](note_category_share.md)

[NoteCategorySubscription](note_category_subscription.md)

[Organization](organization.md)

[OrganizationStatistics](organization_statistics.md)

[PeopleImport](people_import.md)

[PeopleImportConflict](people_import_conflict.md)

[PeopleImportHistory](people_import_history.md)

[Person](person.md)

[PersonApp](person_app.md)

[PersonMerger](person_merger.md)

[PhoneNumber](phone_number.md)

[PlatformNotification](platform_notification.md)

[Report](report.md)

[Rule](rule.md)

[SchoolOption](school_option.md)

[ServiceTime](service_time.md)

[SocialProfile](social_profile.md)

[SpamEmailAddress](spam_email_address.md)

[Tab](tab.md)

[Workflow](workflow.md)

[WorkflowCard](workflow_card.md)

[WorkflowCardActivity](workflow_card_activity.md)

[WorkflowCardNote](workflow_card_note.md)

[WorkflowCategory](workflow_category.md)

[WorkflowShare](workflow_share.md)

[WorkflowStep](workflow_step.md)

[WorkflowStepAssigneeSummary](workflow_step_assignee_summary.md)

[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# FormField

A field in a custom form.

[# Example Request](#/apps/people/2025-03-20/vertices/form_field#example-request)

```
curl https://api.planningcenteronline.com/people/v2/forms/{form_id}/fields
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/forms/{form_id}/fields)

[# Example Object](#/apps/people/2025-03-20/vertices/form_field#example-object)

```
{
  "type": "FormField",
  "id": "1",
  "attributes": {
    "label": "string",
    "description": "string",
    "required": true,
    "settings": "string",
    "field_type": "value",
    "sequence": 1,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {
    "form": {
      "data": {
        "type": "Form",
        "id": "1"
      }
    },
    "fieldable": {
      "data": {
        "type": "Fieldable",
        "id": "1"
      }
    },
    "options": {
      "data": {
        "type": "FormFieldOption",
        "id": "1"
      }
    },
    "form_field_conditions": {
      "data": [
        {
          "type": "FormFieldCondition",
          "id": "1"
        }
      ]
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/form_field#attributes)

Name

Type

Description

`id`

`primary_key`

`label`

`string`

`description`

`string`

`required`

`boolean`

`settings`

`string`

`field_type`

`string`

Possible values: `string`, `text`, `checkboxes`, `dropdown`, `date`, `phone_number`, `address`, `birthday`, `gender`, `custom_field`, `note`, `workflow`, `heading`, `number`, `boolean`, `file`, `medical`, `workflow_checkbox`, `workflow_checkboxes`, `workflow_dropdown`, `marital_status`, `anniversary`, `grade`, `primary_campus`, `school`, or `household`

`sequence`

`integer`

`created_at`

`date_time`

`updated_at`

`date_time`

[# Relationships](#/apps/people/2025-03-20/vertices/form_field#relationships)

Name

Type

Association Type

Note

form

Form

to\_one

fieldable

Fieldable

to\_one

Polymorphic. Fieldable can be any of the following: FieldDefinition, NoteCategory, or Workflow.

options

FormFieldOption

to\_one

form\_field\_conditions

FormFieldCondition

to\_many

[# URL Parameters](#/apps/people/2025-03-20/vertices/form_field#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

options

include associated options

create and update

# Order By

Parameter

Value

Type

Description

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

sequence

string

prefix with a hyphen (-sequence) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

# Pagination

Name

Parameter

Type

Description

per\_page

per\_page

integer

how many records to return per page (min=1, max=100, default=25)

offset

offset

integer

get results from given offset

[# Endpoints](#/apps/people/2025-03-20/vertices/form_field#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/forms/{form_id}/fields`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/forms/{form_id}/fields/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/form_field#associations)

# options

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/forms/{form_id}/fields/{form_field_id}/options`

Copy

[FormFieldOption](form_field_option.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/form_field#belongs-to)

# Form

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/forms/{form_id}/fields`

Copy

[Form](form.md)

# FormSubmission

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/forms/{form_id}/form_submissions/{form_submission_id}/form_fields`

Copy

[FormSubmission](form_submission.md)