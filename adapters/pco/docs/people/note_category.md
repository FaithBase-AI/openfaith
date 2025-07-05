Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](note_category.md)

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

# NoteCategory

A Note Category

[# Example Request](#/apps/people/2025-03-20/vertices/note_category#example-request)

```
curl https://api.planningcenteronline.com/people/v2/note_categories
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/note_categories)

[# Example Object](#/apps/people/2025-03-20/vertices/note_category#example-object)

```
{
  "type": "NoteCategory",
  "id": "1",
  "attributes": {
    "name": "string",
    "locked": true,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "organization_id": "primary_key"
  },
  "relationships": {
    "organization": {
      "data": {
        "type": "Organization",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/note_category#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`locked`

`boolean`

`created_at`

`date_time`

`updated_at`

`date_time`

`organization_id`

`primary_key`

[# Relationships](#/apps/people/2025-03-20/vertices/note_category#relationships)

Name

Type

Association Type

Note

organization

Organization

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/note_category#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

shares

include associated shares

include

subscribers

include associated subscribers

include

subscriptions

include associated subscriptions

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

locked

string

prefix with a hyphen (-locked) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

order

organization\_id

string

prefix with a hyphen (-organization\_id) to reverse the order

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

locked

where[locked]

boolean

Query on a specific locked

`?where[locked]=true`

name

where[name]

string

Query on a specific name

`?where[name]=string`

organization\_id

where[organization\_id]

primary\_key

Query on a specific organization\_id

`?where[organization_id]=primary_key`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/note_category#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/note_categories`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/note_categories/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/note_categories`

Copy

* name

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/note_categories/{id}`

Copy

* name

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/note_categories/{id}`

Copy

Notes:

Deleting a note category will also delete all associated notes

[# Associations](#/apps/people/2025-03-20/vertices/note_category#associations)

# shares

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/note_categories/{note_category_id}/shares`

Copy

[NoteCategoryShare](note_category_share.md)

# subscribers

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/note_categories/{note_category_id}/subscribers`

Copy

[Person](person.md)

# subscriptions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/note_categories/{note_category_id}/subscriptions`

Copy

[NoteCategorySubscription](note_category_subscription.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/note_category#belongs-to)

# Note

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/notes/{note_id}/category`

Copy

[Note](note.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/note_categories`

Copy

[Organization](organization.md)

* `view_creatable`