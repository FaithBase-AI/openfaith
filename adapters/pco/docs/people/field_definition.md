Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](field_definition.md)

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

# FieldDefinition

A field definition represents a custom field -- its name, data type, etc.

[# Example Request](#/apps/people/2025-03-20/vertices/field_definition#example-request)

```
curl https://api.planningcenteronline.com/people/v2/field_definitions
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/field_definitions)

[# Example Object](#/apps/people/2025-03-20/vertices/field_definition#example-object)

```
{
  "type": "FieldDefinition",
  "id": "1",
  "attributes": {
    "data_type": "string",
    "name": "string",
    "sequence": 1,
    "slug": "string",
    "config": "string",
    "deleted_at": "2000-01-01T12:00:00Z",
    "tab_id": "primary_key"
  },
  "relationships": {
    "tab": {
      "data": {
        "type": "Tab",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/field_definition#attributes)

Name

Type

Description

`id`

`primary_key`

`data_type`

`string`

`name`

`string`

`sequence`

`integer`

`slug`

`string`

`config`

`string`

`deleted_at`

`date_time`

`tab_id`

`primary_key`

[# Relationships](#/apps/people/2025-03-20/vertices/field_definition#relationships)

Name

Type

Association Type

Note

tab

Tab

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/field_definition#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

field\_options

include associated field\_options

include

tab

include associated tab

create and update

# Order By

Parameter

Value

Type

Description

order

config

string

prefix with a hyphen (-config) to reverse the order

order

data\_type

string

prefix with a hyphen (-data\_type) to reverse the order

order

deleted\_at

string

prefix with a hyphen (-deleted\_at) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

order

sequence

string

prefix with a hyphen (-sequence) to reverse the order

order

slug

string

prefix with a hyphen (-slug) to reverse the order

order

tab\_id

string

prefix with a hyphen (-tab\_id) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

config

where[config]

string

Query on a specific config

`?where[config]=string`

data\_type

where[data\_type]

string

Query on a specific data\_type

`?where[data_type]=string`

deleted\_at

where[deleted\_at]

date\_time

Query on a specific deleted\_at

`?where[deleted_at]=2000-01-01T12:00:00Z`

name

where[name]

string

Query on a specific name

`?where[name]=string`

sequence

where[sequence]

integer

Query on a specific sequence

`?where[sequence]=1`

slug

where[slug]

string

Query on a specific slug

`?where[slug]=string`

tab\_id

where[tab\_id]

primary\_key

Query on a specific tab\_id

`?where[tab_id]=primary_key`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/field_definition#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/field_definitions`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/field_definitions/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/tabs/{tab_id}/field_definitions`

Copy

* data\_type
* name
* sequence
* slug
* config
* deleted\_at

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/field_definitions/{id}`

Copy

* data\_type
* name
* sequence
* slug
* config
* deleted\_at

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/field_definitions/{id}`

Copy

Notes:

Deleting a field definition internally sets its `deleted_at` attribute to the current time.

[# Associations](#/apps/people/2025-03-20/vertices/field_definition#associations)

# field\_options

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/field_definitions/{field_definition_id}/field_options`

Copy

[FieldOption](field_option.md)

# tab

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/field_definitions/{field_definition_id}/tab`

Copy

[Tab](tab.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/field_definition#belongs-to)

# FieldDatum

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/field_data/{field_datum_id}/field_definition`

Copy

[FieldDatum](field_datum.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/field_definitions`

Copy

[Organization](organization.md)

* `include_deleted` — By default, deleted fields are not included. Pass filter=include\_deleted to include them.

# Tab

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/tabs/{tab_id}/field_definitions`

Copy

[Tab](tab.md)

* `with_deleted`