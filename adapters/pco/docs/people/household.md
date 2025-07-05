Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](household.md)

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

# Household

A household links people together and can have a primary contact. To add a person to an existing household, use the HouseholdMemberships endpoint.

[# Example Request](#/apps/people/2025-03-20/vertices/household#example-request)

```
curl https://api.planningcenteronline.com/people/v2/households
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/households)

[# Example Object](#/apps/people/2025-03-20/vertices/household#example-object)

```
{
  "type": "Household",
  "id": "1",
  "attributes": {
    "name": "string",
    "member_count": 1,
    "primary_contact_name": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "avatar": "string",
    "primary_contact_id": "primary_key"
  },
  "relationships": {
    "primary_contact": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "people": {
      "data": [
        {
          "type": "Person",
          "id": "1"
        }
      ]
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/household#attributes)

Name

Type

Description

Note

`id`

`primary_key`

`name`

`string`

`member_count`

`integer`

`primary_contact_name`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

`avatar`

`string`

File UUID (see [File Uploads](#file-uploads) section)

`primary_contact_id`

`primary_key`

[# Relationships](#/apps/people/2025-03-20/vertices/household#relationships)

Name

Type

Association Type

Note

primary\_contact

Person

to\_one

people

Person

to\_many

[# URL Parameters](#/apps/people/2025-03-20/vertices/household#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

people

include associated people

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

member\_count

string

prefix with a hyphen (-member\_count) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

order

primary\_contact\_name

string

prefix with a hyphen (-primary\_contact\_name) to reverse the order

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

member\_count

where[member\_count]

integer

Query on a specific member\_count

`?where[member_count]=1`

name

where[name]

string

Query on a specific name

`?where[name]=string`

primary\_contact\_name

where[primary\_contact\_name]

string

Query on a specific primary\_contact\_name

`?where[primary_contact_name]=string`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/household#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/households`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/households/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/households`

Copy

* name
* member\_count
* avatar
* primary\_contact\_id

Notes:

To create a new household, you must specify the primary contact and the people as relationships:
`{"data":{"attributes":{"name":"Smith"},"relationships":{"people":{"data":[{"type":"Person","id":"1"},{"type":"Person","id":"2"}]},"primary_contact":{"data":{"type":"Person","id":"1"}}}}}`

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/households/{id}`

Copy

* name
* member\_count
* avatar
* primary\_contact\_id

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/households/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/household#associations)

# household\_memberships

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/households/{household_id}/household_memberships`

Copy

[HouseholdMembership](household_membership.md)

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/households/{household_id}/people`

Copy

[Person](person.md)

* `non_pending`
* `without_deceased`

[# Belongs To](#/apps/people/2025-03-20/vertices/household#belongs-to)

# HouseholdMembership

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/households/{household_id}/household_memberships/{household_membership_id}/household`

Copy

[HouseholdMembership](household_membership.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/households`

Copy

[Organization](organization.md)

# PeopleImportHistory

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people_imports/{people_import_id}/histories/{people_import_history_id}/household`

Copy

[PeopleImportHistory](people_import_history.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/households`

Copy

[Person](person.md)