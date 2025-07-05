Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](workflow_card.md)

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

# WorkflowCard

A Card

[# Example Request](#/apps/people/2025-03-20/vertices/workflow_card#example-request)

```
curl https://api.planningcenteronline.com/people/v2/people/{person_id}/workflow_cards
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/people/{person_id}/workflow_cards)

[# Example Object](#/apps/people/2025-03-20/vertices/workflow_card#example-object)

```
{
  "type": "WorkflowCard",
  "id": "1",
  "attributes": {
    "snooze_until": "2000-01-01T12:00:00Z",
    "overdue": true,
    "stage": "string",
    "calculated_due_at_in_days_ago": 1,
    "sticky_assignment": true,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "completed_at": "2000-01-01T12:00:00Z",
    "flagged_for_notification_at": "2000-01-01T12:00:00Z",
    "removed_at": "2000-01-01T12:00:00Z",
    "moved_to_step_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {
    "assignee": {
      "data": {
        "type": "Assignee",
        "id": "1"
      }
    },
    "person": {
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
    },
    "current_step": {
      "data": {
        "type": "WorkflowStep",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/workflow_card#attributes)

Name

Type

Description

`id`

`primary_key`

`snooze_until`

`date_time`

`overdue`

`boolean`

`stage`

`string`

`calculated_due_at_in_days_ago`

`integer`

`sticky_assignment`

`boolean`

`created_at`

`date_time`

`updated_at`

`date_time`

`completed_at`

`date_time`

`flagged_for_notification_at`

`date_time`

`removed_at`

`date_time`

`moved_to_step_at`

`date_time`

[# Relationships](#/apps/people/2025-03-20/vertices/workflow_card#relationships)

Name

Type

Association Type

Note

assignee

Assignee

to\_one

person

Person

to\_one

workflow

Workflow

to\_one

current\_step

WorkflowStep

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/workflow_card#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

assignee

include associated assignee

create and update

include

current\_step

include associated current\_step

create and update

include

person

include associated person

create and update

include

workflow

include associated workflow

create and update

# Order By

Parameter

Value

Type

Description

order

completed\_at

string

prefix with a hyphen (-completed\_at) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

first\_name

string

prefix with a hyphen (-first\_name) to reverse the order

order

flagged\_for\_notification\_at

string

prefix with a hyphen (-flagged\_for\_notification\_at) to reverse the order

order

last\_name

string

prefix with a hyphen (-last\_name) to reverse the order

order

moved\_to\_step\_at

string

prefix with a hyphen (-moved\_to\_step\_at) to reverse the order

order

removed\_at

string

prefix with a hyphen (-removed\_at) to reverse the order

order

stage

string

prefix with a hyphen (-stage) to reverse the order

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

assignee\_id

where[assignee\_id]

integer

Query on a related assignee

`?where[assignee_id]=1`

overdue

where[overdue]

boolean

Query on a specific overdue

`?where[overdue]=true`

stage

where[stage]

string

Query on a specific stage

`?where[stage]=string`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/workflow_card#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/people/{person_id}/workflow_cards`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/people/{person_id}/workflow_cards/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/workflows/{workflow_id}/cards`

Copy

* sticky\_assignment
* assignee\_id
* person\_id

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/people/{person_id}/workflow_cards/{id}`

Copy

* sticky\_assignment
* assignee\_id
* person\_id

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/people/{person_id}/workflow_cards/{id}`

Copy

[# Actions](#/apps/people/2025-03-20/vertices/workflow_card#actions)

# go\_back

HTTP Method

Endpoint

Description

POST

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/go_back`

Copy

Move a Workflow Card back to the previous step.

Permissions:

Must be authenticated

# promote

HTTP Method

Endpoint

Description

POST

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/promote`

Copy

Move a Workflow Card to the next step.

Permissions:

Must be authenticated

# remove

HTTP Method

Endpoint

Description

POST

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/remove`

Copy

Removes a card

Permissions:

Must be authenticated

# restore

HTTP Method

Endpoint

Description

POST

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/restore`

Copy

Restore a card

Permissions:

Must be authenticated

# send\_email

HTTP Method

Endpoint

Description

POST

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/send_email`

Copy

Sends an email to the subject of the card

Details:

Pass in a subject and note.

Example Post Body:

```
{
  "data": {
    "attributes": {
      "subject": "Thanks for visiting this past Sunday!",
      "note": "It was great to meet you this past Sunday! Hope to see you again."
    }
  }
}
```

Permissions:

Must be authenticated

# skip\_step

HTTP Method

Endpoint

Description

POST

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/skip_step`

Copy

Move a Workflow Card to the next step without completing the current step.

Permissions:

Must be authenticated

# snooze

HTTP Method

Endpoint

Description

POST

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/snooze`

Copy

Snoozes a card for a specific duration

Details:

Pass in a duration in days.

Example Post Body:

```
{
  "data": {
    "attributes": {
      "duration": 15
    }
  }
}
```

Permissions:

Must be an editor or the person the card is assigned to

# unsnooze

HTTP Method

Endpoint

Description

POST

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/unsnooze`

Copy

Unsnoozes a card

Permissions:

Must be authenticated

[# Associations](#/apps/people/2025-03-20/vertices/workflow_card#associations)

# activities

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/activities`

Copy

[WorkflowCardActivity](workflow_card_activity.md)

# assignee

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/assignee`

Copy

[Person](person.md)

# current\_step

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/current_step`

Copy

[WorkflowStep](workflow_step.md)

# notes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/notes`

Copy

[WorkflowCardNote](workflow_card_note.md)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/person`

Copy

[Person](person.md)

# workflow

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/workflow`

Copy

[Workflow](workflow.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/workflow_card#belongs-to)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards`

Copy

[Person](person.md)

* `assigned`

# Workflow

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/cards`

Copy

[Workflow](workflow.md)