Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](people_import.md)

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

# PeopleImport

A PeopleImport is a record of an ongoing or previous import from a CSV file.

[# Example Request](#/apps/people/2025-03-20/vertices/people_import#example-request)

```
curl https://api.planningcenteronline.com/people/v2/people_imports
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/people_imports)

[# Example Object](#/apps/people/2025-03-20/vertices/people_import#example-object)

```
{
  "type": "PeopleImport",
  "id": "1",
  "attributes": {
    "attribs": "string",
    "status": "value",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "processed_at": "2000-01-01T12:00:00Z",
    "undone_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {
    "created_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "undone_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/people_import#attributes)

Name

Type

Description

`id`

`primary_key`

`attribs`

`string`

`status`

`string`

Possible values: `matching`, `processing_preview`, `previewing`, `processing_import`, `complete`, `undone`, or `undoing`

`created_at`

`date_time`

`updated_at`

`date_time`

`processed_at`

`date_time`

`undone_at`

`date_time`

[# Relationships](#/apps/people/2025-03-20/vertices/people_import#relationships)

Name

Type

Association Type

Note

created\_by

Person

to\_one

undone\_by

Person

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/people_import#url-parameters)

# Query By

Name

Parameter

Type

Description

Example

status

where[status]

string

Query on a specific status

Possible values: `matching`, `processing_preview`, `previewing`, `processing_import`, `complete`, `undone`, or `undoing`

`?where[status]=value`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/people_import#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/people_imports`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/people_imports/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/people_import#associations)

# conflicts

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people_imports/{people_import_id}/conflicts`

Copy

[PeopleImportConflict](people_import_conflict.md)

* `creates`
* `creates_and_updates`
* `errors`
* `household_creates`
* `household_updates`
* `identical`
* `ignored`
* `not_ignored`
* `updates`

# histories

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people_imports/{people_import_id}/histories`

Copy

[PeopleImportHistory](people_import_history.md)

* `creates`
* `household_creates`
* `household_updates`
* `identical`
* `updates`

[# Belongs To](#/apps/people/2025-03-20/vertices/people_import#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people_imports`

Copy

[Organization](organization.md)