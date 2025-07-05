Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](list.md)

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

# List

A list is a powerful tool for finding and grouping people together using any criteria imaginable.

[# Example Request](#/apps/people/2025-03-20/vertices/list#example-request)

```
curl https://api.planningcenteronline.com/people/v2/lists
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/lists)

[# Example Object](#/apps/people/2025-03-20/vertices/list#example-object)

```
{
  "type": "List",
  "id": "1",
  "attributes": {
    "name": "string",
    "auto_refresh": true,
    "status": "string",
    "has_inactive_results": true,
    "include_inactive": true,
    "returns": "string",
    "return_original_if_none": true,
    "subset": "string",
    "automations_active": true,
    "automations_count": 1,
    "paused_automations_count": 1,
    "description": "string",
    "invalid": true,
    "auto_refresh_frequency": "string",
    "name_or_description": "string",
    "recently_viewed": true,
    "refreshed_at": "2000-01-01T12:00:00Z",
    "starred": true,
    "total_people": 1,
    "batch_completed_at": "2000-01-01T12:00:00Z",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/list#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`auto_refresh`

`boolean`

`status`

`string`

`has_inactive_results`

`boolean`

`include_inactive`

`boolean`

`returns`

`string`

`return_original_if_none`

`boolean`

`subset`

`string`

`automations_active`

`boolean`

`automations_count`

`integer`

`paused_automations_count`

`integer`

`description`

`string`

`invalid`

`boolean`

`auto_refresh_frequency`

`string`

`name_or_description`

`string`

`recently_viewed`

`boolean`

`refreshed_at`

`date_time`

`starred`

`boolean`

`total_people`

`integer`

`batch_completed_at`

`date_time`

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/people/2025-03-20/vertices/list#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

campus

include associated campus

create and update

include

category

include associated category

include

created\_by

include associated created\_by

include

mailchimp\_sync\_status

include associated mailchimp\_sync\_status

include

people

include associated people

include

rules

include associated rules

include

shares

include associated shares

include

updated\_by

include associated updated\_by

# Order By

Parameter

Value

Type

Description

order

batch\_completed\_at

string

prefix with a hyphen (-batch\_completed\_at) to reverse the order

order

campus\_id

string

prefix with a hyphen (-campus\_id) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

list\_categories.name

string

prefix with a hyphen (-list\_categories.name) to reverse the order

order

list\_category\_id

string

prefix with a hyphen (-list\_category\_id) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

order

name\_or\_description

string

prefix with a hyphen (-name\_or\_description) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

batch\_completed\_at

where[batch\_completed\_at]

date\_time

Query on a specific batch\_completed\_at

`?where[batch_completed_at]=2000-01-01T12:00:00Z`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/list#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/lists`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/lists/{id}`

Copy

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/lists/{id}`

Copy

[# Actions](#/apps/people/2025-03-20/vertices/list#actions)

# mailchimp\_sync

HTTP Method

Endpoint

Description

POST

`/people/v2/lists/{list_id}/mailchimp_sync`

Copy

Sync a List to Mailchimp. (Mailchimp integration must already be configured for this organization.)

Permissions:

Must be authenticated

# run

HTTP Method

Endpoint

Description

POST

`/people/v2/lists/{list_id}/run`

Copy

Run a List to update its results.

Permissions:

Must be authenticated

[# Associations](#/apps/people/2025-03-20/vertices/list#associations)

# campus

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists/{list_id}/campus`

Copy

[Campus](campus.md)

# category

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists/{list_id}/category`

Copy

[ListCategory](list_category.md)

# created\_by

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists/{list_id}/created_by`

Copy

[Person](person.md)

# list\_results

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists/{list_id}/list_results`

Copy

[ListResult](list_result.md)

# mailchimp\_sync\_status

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists/{list_id}/mailchimp_sync_status`

Copy

[MailchimpSyncStatus](mailchimp_sync_status.md)

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists/{list_id}/people`

Copy

[Person](person.md)

# rules

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists/{list_id}/rules`

Copy

[Rule](rule.md)

# shares

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists/{list_id}/shares`

Copy

[ListShare](list_share.md)

# star

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists/{list_id}/star`

Copy

[ListStar](list_star.md)

# updated\_by

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists/{list_id}/updated_by`

Copy

[Person](person.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/list#belongs-to)

# Campus

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/campuses/{campus_id}/lists`

Copy

[Campus](campus.md)

# ListCategory

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/list_categories/{list_category_id}/lists`

Copy

[ListCategory](list_category.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/lists`

Copy

[Organization](organization.md)

* `can_manage`
* `recently_viewed`
* `starred`
* `unassigned`