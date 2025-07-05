Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](note.md)

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

# Note

A note is text with a category connected to a person’s profile.

[# Example Request](#/apps/people/2025-03-20/vertices/note#example-request)

```
curl https://api.planningcenteronline.com/people/v2/notes
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/notes)

[# Example Object](#/apps/people/2025-03-20/vertices/note#example-object)

```
{
  "type": "Note",
  "id": "1",
  "attributes": {
    "note": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "display_date": "2000-01-01T12:00:00Z",
    "note_category_id": "primary_key",
    "organization_id": "primary_key",
    "person_id": "primary_key",
    "created_by_id": "primary_key"
  },
  "relationships": {
    "note_category": {
      "data": {
        "type": "NoteCategory",
        "id": "1"
      }
    },
    "organization": {
      "data": {
        "type": "Organization",
        "id": "1"
      }
    },
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "created_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/note#attributes)

Name

Type

Description

`id`

`primary_key`

`note`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

`display_date`

`date_time`

`note_category_id`

`primary_key`

`organization_id`

`primary_key`

`person_id`

`primary_key`

`created_by_id`

`primary_key`

[# Relationships](#/apps/people/2025-03-20/vertices/note#relationships)

Name

Type

Association Type

Note

note\_category

NoteCategory

to\_one

organization

Organization

to\_one

person

Person

to\_one

created\_by

Person

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/note#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

category

include associated category

include

created\_by

include associated created\_by

create and update

include

person

include associated person

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

display\_date

string

prefix with a hyphen (-display\_date) to reverse the order

order

id

string

prefix with a hyphen (-id) to reverse the order

order

note

string

prefix with a hyphen (-note) to reverse the order

order

note\_category\_id

string

prefix with a hyphen (-note\_category\_id) to reverse the order

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

note

where[note]

string

Query on a specific note

`?where[note]=string`

note\_category\_id

where[note\_category\_id]

primary\_key

Query on a specific note\_category\_id

`?where[note_category_id]=primary_key`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/note#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/notes`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/notes/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/people/{person_id}/notes`

Copy

* note
* created\_at
* updated\_at
* display\_date
* note\_category\_id

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/notes/{id}`

Copy

* note
* created\_at
* updated\_at
* display\_date
* note\_category\_id

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/notes/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/note#associations)

# category

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/notes/{note_id}/category`

Copy

[NoteCategory](note_category.md)

# created\_by

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/notes/{note_id}/created_by`

Copy

[Person](person.md)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/notes/{note_id}/person`

Copy

[Person](person.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/note#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/notes`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/notes`

Copy

[Person](person.md)