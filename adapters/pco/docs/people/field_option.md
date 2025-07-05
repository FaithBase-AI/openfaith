Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](field_option.md)

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

# FieldOption

A field option represents an individual option for a custom field of type "select" or "checkboxes".

[# Example Request](#/apps/people/2025-03-20/vertices/field_option#example-request)

```
curl https://api.planningcenteronline.com/people/v2/field_definitions/{field_definition_id}/field_options
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/field_definitions/{field_definition_id}/field_options)

[# Example Object](#/apps/people/2025-03-20/vertices/field_option#example-object)

```
{
  "type": "FieldOption",
  "id": "1",
  "attributes": {
    "value": "string",
    "sequence": 1
  },
  "relationships": {
    "field_definition": {
      "data": {
        "type": "FieldDefinition",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/field_option#attributes)

Name

Type

Description

`id`

`primary_key`

`value`

`string`

`sequence`

`integer`

[# Relationships](#/apps/people/2025-03-20/vertices/field_option#relationships)

Name

Type

Association Type

Note

field\_definition

FieldDefinition

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/field_option#url-parameters)

# Order By

Parameter

Value

Type

Description

order

sequence

string

prefix with a hyphen (-sequence) to reverse the order

order

value

string

prefix with a hyphen (-value) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

sequence

where[sequence]

integer

Query on a specific sequence

`?where[sequence]=1`

value

where[value]

string

Query on a specific value

`?where[value]=string`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/field_option#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/field_definitions/{field_definition_id}/field_options`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/field_definitions/{field_definition_id}/field_options/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/field_definitions/{field_definition_id}/field_options`

Copy

* value
* sequence

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/field_definitions/{field_definition_id}/field_options/{id}`

Copy

* value
* sequence

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/field_definitions/{field_definition_id}/field_options/{id}`

Copy

[# Belongs To](#/apps/people/2025-03-20/vertices/field_option#belongs-to)

# FieldDatum

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/field_data/{field_datum_id}/field_option`

Copy

[FieldDatum](field_datum.md)

# FieldDefinition

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/field_definitions/{field_definition_id}/field_options`

Copy

[FieldDefinition](field_definition.md)

# Tab

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/tabs/{tab_id}/field_options`

Copy

[Tab](tab.md)