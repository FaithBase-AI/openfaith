Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](people_import_history.md)

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

# PeopleImportHistory

A PeopleImportHistory is a record of change that occurred when the parent PeopleImport was completed.

[# Example Request](#/apps/people/2025-03-20/vertices/people_import_history#example-request)

```
curl https://api.planningcenteronline.com/people/v2/people_imports/{people_import_id}/histories
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/people_imports/{people_import_id}/histories)

[# Example Object](#/apps/people/2025-03-20/vertices/people_import_history#example-object)

```
{
  "type": "PeopleImportHistory",
  "id": "1",
  "attributes": {
    "name": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "conflicting_changes": {},
    "kind": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/people_import_history#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

`conflicting_changes`

`hash`

`kind`

`string`

[# URL Parameters](#/apps/people/2025-03-20/vertices/people_import_history#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

household

include associated household

include

person

include associated person

# Query By

Name

Parameter

Type

Description

Example

name

where[name]

string

Query on a specific name

`?where[name]=string`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/people_import_history#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/people_imports/{people_import_id}/histories`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/people_imports/{people_import_id}/histories/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/people_import_history#associations)

# household

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people_imports/{people_import_id}/histories/{people_import_history_id}/household`

Copy

[Household](household.md)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people_imports/{people_import_id}/histories/{people_import_history_id}/person`

Copy

[Person](person.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/people_import_history#belongs-to)

# PeopleImport

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people_imports/{people_import_id}/histories`

Copy

[PeopleImport](people_import.md)

* `creates`
* `household_creates`
* `household_updates`
* `identical`
* `updates`