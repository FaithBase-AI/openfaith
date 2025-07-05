Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](campus.md)

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

# Campus

A Campus is a location belonging to an Organization

[# Example Request](#/apps/people/2025-03-20/vertices/campus#example-request)

```
curl https://api.planningcenteronline.com/people/v2/campuses
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/campuses)

[# Example Object](#/apps/people/2025-03-20/vertices/campus#example-object)

```
{
  "type": "Campus",
  "id": "1",
  "attributes": {
    "latitude": 1.42,
    "longitude": 1.42,
    "description": "string",
    "street": "string",
    "city": "string",
    "state": "string",
    "zip": "string",
    "country": "string",
    "phone_number": "string",
    "website": "string",
    "twenty_four_hour_time": true,
    "date_format": 1,
    "church_center_enabled": true,
    "contact_email_address": "string",
    "time_zone": "string",
    "geolocation_set_manually": true,
    "time_zone_raw": "string",
    "name": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "avatar_url": "string"
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

[# Attributes](#/apps/people/2025-03-20/vertices/campus#attributes)

Name

Type

Description

`id`

`primary_key`

`latitude`

`float`

`longitude`

`float`

`description`

`string`

`street`

`string`

`city`

`string`

`state`

`string`

`zip`

`string`

`country`

`string`

`phone_number`

`string`

`website`

`string`

`twenty_four_hour_time`

`boolean`

`date_format`

`integer`

`church_center_enabled`

`boolean`

`contact_email_address`

`string`

`time_zone`

`string`

`geolocation_set_manually`

`boolean`

`time_zone_raw`

`string`

Only available when requested with the `?fields` param

`name`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

`avatar_url`

`string`

[# Relationships](#/apps/people/2025-03-20/vertices/campus#relationships)

Name

Type

Association Type

Note

organization

Organization

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/campus#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

lists

include associated lists

include

service\_times

include associated service\_times

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

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/campus#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/campuses`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/campuses/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/campuses`

Copy

* latitude
* longitude
* description
* street
* city
* state
* zip
* country
* phone\_number
* website
* twenty\_four\_hour\_time
* date\_format
* church\_center\_enabled
* contact\_email\_address
* time\_zone
* geolocation\_set\_manually
* name

Notes:

Must be an Organization Administrator

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/campuses/{id}`

Copy

* latitude
* longitude
* description
* street
* city
* state
* zip
* country
* phone\_number
* website
* twenty\_four\_hour\_time
* date\_format
* church\_center\_enabled
* contact\_email\_address
* time\_zone
* geolocation\_set\_manually
* name

Notes:

Must be an Organization Administrator

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/campuses/{id}`

Copy

Notes:

Must be an Organization Administrator

[# Associations](#/apps/people/2025-03-20/vertices/campus#associations)

# lists

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/campuses/{campus_id}/lists`

Copy

[List](list.md)

# service\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/campuses/{campus_id}/service_times`

Copy

[ServiceTime](service_time.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/campus#belongs-to)

# Form

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/forms/{form_id}/campus`

Copy

[Form](form.md)

# List

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/lists/{list_id}/campus`

Copy

[List](list.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/campuses`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/primary_campus`

Copy

[Person](person.md)