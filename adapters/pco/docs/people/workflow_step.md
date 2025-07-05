Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](workflow_step.md)

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

# WorkflowStep

A Step

[# Example Request](#/apps/people/2025-03-20/vertices/workflow_step#example-request)

```
curl https://api.planningcenteronline.com/people/v2/workflows/{workflow_id}/steps
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/workflows/{workflow_id}/steps)

[# Example Object](#/apps/people/2025-03-20/vertices/workflow_step#example-object)

```
{
  "type": "WorkflowStep",
  "id": "1",
  "attributes": {
    "sequence": 1,
    "name": "string",
    "description": "string",
    "expected_response_time_in_days": 1,
    "auto_snooze_value": 1,
    "auto_snooze_interval": "value",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "auto_snooze_days": 1,
    "my_ready_card_count": 1,
    "total_ready_card_count": 1,
    "default_assignee_id": "primary_key"
  },
  "relationships": {
    "default_assignee": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "workflow": {
      "data": {
        "type": "Workflow",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/workflow_step#attributes)

Name

Type

Description

`id`

`primary_key`

`sequence`

`integer`

`name`

`string`

`description`

`string`

`expected_response_time_in_days`

`integer`

`auto_snooze_value`

`integer`

Must be a positive number

`auto_snooze_interval`

`string`

Valid values are `day`, `week`, or `month`

Possible values: `day`, `week`, or `month`

`created_at`

`date_time`

`updated_at`

`date_time`

`auto_snooze_days`

`integer`

`my_ready_card_count`

`integer`

`total_ready_card_count`

`integer`

`default_assignee_id`

`primary_key`

[# Relationships](#/apps/people/2025-03-20/vertices/workflow_step#relationships)

Name

Type

Association Type

Note

default\_assignee

Person

to\_one

workflow

Workflow

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/workflow_step#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

default\_assignee

include associated default\_assignee

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

name

string

prefix with a hyphen (-name) to reverse the order

order

sequence

string

prefix with a hyphen (-sequence) to reverse the order

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

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/workflow_step#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/workflows/{workflow_id}/steps`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/workflows/{workflow_id}/steps/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/workflows/{workflow_id}/steps`

Copy

* sequence
* name
* description
* expected\_response\_time\_in\_days
* default\_assignee\_id
* auto\_snooze\_value
* auto\_snooze\_interval

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/workflows/{workflow_id}/steps/{id}`

Copy

* sequence
* name
* description
* expected\_response\_time\_in\_days
* default\_assignee\_id
* auto\_snooze\_value
* auto\_snooze\_interval

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/workflows/{workflow_id}/steps/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/workflow_step#associations)

# assignee\_summaries

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/steps/{workflow_step_id}/assignee_summaries`

Copy

[WorkflowStepAssigneeSummary](workflow_step_assignee_summary.md)

# default\_assignee

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/steps/{workflow_step_id}/default_assignee`

Copy

[Person](person.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/workflow_step#belongs-to)

# WorkflowCard

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/current_step`

Copy

[WorkflowCard](workflow_card.md)

# Workflow

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/steps`

Copy

[Workflow](workflow.md)