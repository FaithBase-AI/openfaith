Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](workflow.md)

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

# Workflow

A Workflow

[# Example Request](#/apps/people/2025-03-20/vertices/workflow#example-request)

```
curl https://api.planningcenteronline.com/people/v2/workflows
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/workflows)

[# Example Object](#/apps/people/2025-03-20/vertices/workflow#example-object)

```
{
  "type": "Workflow",
  "id": "1",
  "attributes": {
    "name": "string",
    "my_ready_card_count": 1,
    "total_ready_card_count": 1,
    "completed_card_count": 1,
    "total_cards_count": 1,
    "total_ready_and_snoozed_card_count": 1,
    "total_steps_count": 1,
    "total_unassigned_steps_count": 1,
    "total_unassigned_card_count": 1,
    "total_overdue_card_count": 1,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "deleted_at": "2000-01-01T12:00:00Z",
    "archived_at": "2000-01-01T12:00:00Z",
    "campus_id": "primary_key",
    "workflow_category_id": "primary_key",
    "my_overdue_card_count": 1,
    "my_due_soon_card_count": 1,
    "recently_viewed": true
  },
  "relationships": {
    "workflow_category": {
      "data": {
        "type": "WorkflowCategory",
        "id": "1"
      }
    },
    "campus": {
      "data": {
        "type": "Campus",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/workflow#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`my_ready_card_count`

`integer`

`total_ready_card_count`

`integer`

`completed_card_count`

`integer`

`total_cards_count`

`integer`

`total_ready_and_snoozed_card_count`

`integer`

`total_steps_count`

`integer`

`total_unassigned_steps_count`

`integer`

`total_unassigned_card_count`

`integer`

`total_overdue_card_count`

`integer`

`created_at`

`date_time`

`updated_at`

`date_time`

`deleted_at`

`date_time`

`archived_at`

`date_time`

`campus_id`

`primary_key`

`workflow_category_id`

`primary_key`

`my_overdue_card_count`

`integer`

Only available when requested with the `?fields` param

`my_due_soon_card_count`

`integer`

Only available when requested with the `?fields` param

`recently_viewed`

`boolean`

[# Relationships](#/apps/people/2025-03-20/vertices/workflow#relationships)

Name

Type

Association Type

Note

workflow\_category

WorkflowCategory

to\_one

campus

Campus

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/workflow#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

category

include associated category

include

shares

include associated shares

include

steps

include associated steps

# Order By

Parameter

Value

Type

Description

order

archived\_at

string

prefix with a hyphen (-archived\_at) to reverse the order

order

campus\_id

string

prefix with a hyphen (-campus\_id) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

deleted\_at

string

prefix with a hyphen (-deleted\_at) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

order

workflow\_category\_id

string

prefix with a hyphen (-workflow\_category\_id) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

archived\_at

where[archived\_at]

date\_time

Query on a specific archived\_at

`?where[archived_at]=2000-01-01T12:00:00Z`

campus\_id

where[campus\_id]

primary\_key

Query on a specific campus\_id

`?where[campus_id]=primary_key`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

deleted\_at

where[deleted\_at]

date\_time

Query on a specific deleted\_at

`?where[deleted_at]=2000-01-01T12:00:00Z`

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

name

where[name]

string

Query on a specific name

`?where[name]=string`

updated\_at

where[updated\_at]

date\_time

Query on a specific updated\_at

`?where[updated_at]=2000-01-01T12:00:00Z`

workflow\_category\_id

where[workflow\_category\_id]

primary\_key

Query on a specific workflow\_category\_id

`?where[workflow_category_id]=primary_key`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/workflow#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/workflows`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/workflows/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/workflows`

Copy

* name
* campus\_id
* workflow\_category\_id

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/workflows/{id}`

Copy

* name
* campus\_id
* workflow\_category\_id

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/workflows/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/workflow#associations)

# cards

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/cards`

Copy

[WorkflowCard](workflow_card.md)

# category

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/category`

Copy

[WorkflowCategory](workflow_category.md)

# shared\_people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/shared_people`

Copy

[Person](person.md)

# shares

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/shares`

Copy

[WorkflowShare](workflow_share.md)

# steps

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/steps`

Copy

[WorkflowStep](workflow_step.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/workflow#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/workflows`

Copy

[Organization](organization.md)

* `archived`
* `has_my_cards`
* `manage_cards_allowed`
* `not_archived`
* `only_deleted`
* `recently_viewed`
* `unassigned`
* `with_deleted`
* `with_recoverable`
* `with_steps`

# WorkflowCard

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/workflow`

Copy

[WorkflowCard](workflow_card.md)