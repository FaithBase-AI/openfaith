Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](phone_number.md)

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

# PhoneNumber

A phone number represents a single telephone number and location.

[# Example Request](#/apps/people/2025-03-20/vertices/phone_number#example-request)

```
curl https://api.planningcenteronline.com/people/v2/phone_numbers
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/phone_numbers)

[# Example Object](#/apps/people/2025-03-20/vertices/phone_number#example-object)

```
{
  "type": "PhoneNumber",
  "id": "1",
  "attributes": {
    "number": "string",
    "carrier": "string",
    "location": "string",
    "primary": true,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "e164": "string",
    "international": "string",
    "national": "string",
    "country_code": "string",
    "formatted_number": "string"
  },
  "relationships": {
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/phone_number#attributes)

Name

Type

Description

`id`

`primary_key`

`number`

`string`

`carrier`

`string`

`location`

`string`

`primary`

`boolean`

`created_at`

`date_time`

`updated_at`

`date_time`

`e164`

`string`

`international`

`string`

`national`

`string`

`country_code`

`string`

`formatted_number`

`string`

Only available when requested with the `?fields` param

[# Relationships](#/apps/people/2025-03-20/vertices/phone_number#relationships)

Name

Type

Association Type

Note

person

Person

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/phone_number#url-parameters)

# Order By

Parameter

Value

Type

Description

order

carrier

string

prefix with a hyphen (-carrier) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

location

string

prefix with a hyphen (-location) to reverse the order

order

number

string

prefix with a hyphen (-number) to reverse the order

order

primary

string

prefix with a hyphen (-primary) to reverse the order

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

carrier

where[carrier]

string

Query on a specific carrier

`?where[carrier]=string`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

location

where[location]

string

Query on a specific location

`?where[location]=string`

number

where[number]

string

Query on a specific number

`?where[number]=string`

primary

where[primary]

boolean

Query on a specific primary

`?where[primary]=true`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/phone_number#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/phone_numbers`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/phone_numbers/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/people/{person_id}/phone_numbers`

Copy

* number
* carrier
* location
* primary

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/phone_numbers/{id}`

Copy

* number
* carrier
* location
* primary

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/phone_numbers/{id}`

Copy

[# Belongs To](#/apps/people/2025-03-20/vertices/phone_number#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/phone_numbers`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/phone_numbers`

Copy

[Person](person.md)