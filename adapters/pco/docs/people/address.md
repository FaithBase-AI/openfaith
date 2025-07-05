Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](address.md)

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

# Address

An address represents a physical and/or mailing address for a person.

[# Example Request](#/apps/people/2025-03-20/vertices/address#example-request)

```
curl https://api.planningcenteronline.com/people/v2/addresses
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/addresses)

[# Example Object](#/apps/people/2025-03-20/vertices/address#example-object)

```
{
  "type": "Address",
  "id": "1",
  "attributes": {
    "city": "string",
    "state": "string",
    "zip": "string",
    "country_code": "string",
    "location": "string",
    "primary": true,
    "street_line_1": "string",
    "street_line_2": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "country_name": "string"
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

[# Attributes](#/apps/people/2025-03-20/vertices/address#attributes)

Name

Type

Description

`id`

`primary_key`

`city`

`string`

`state`

`string`

`zip`

`string`

`country_code`

`string`

`location`

`string`

`primary`

`boolean`

`street_line_1`

`string`

`street_line_2`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

`country_name`

`string`

[# Relationships](#/apps/people/2025-03-20/vertices/address#relationships)

Name

Type

Association Type

Note

person

Person

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/address#url-parameters)

# Order By

Parameter

Value

Type

Description

order

city

string

prefix with a hyphen (-city) to reverse the order

order

country\_code

string

prefix with a hyphen (-country\_code) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

location

string

prefix with a hyphen (-location) to reverse the order

order

primary

string

prefix with a hyphen (-primary) to reverse the order

order

state

string

prefix with a hyphen (-state) to reverse the order

order

street\_line\_1

string

prefix with a hyphen (-street\_line\_1) to reverse the order

order

street\_line\_2

string

prefix with a hyphen (-street\_line\_2) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

order

zip

string

prefix with a hyphen (-zip) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

city

where[city]

string

Query on a specific city

`?where[city]=string`

country\_code

where[country\_code]

string

Query on a specific country\_code

`?where[country_code]=string`

location

where[location]

string

Query on a specific location

`?where[location]=string`

primary

where[primary]

boolean

Query on a specific primary

`?where[primary]=true`

state

where[state]

string

Query on a specific state

`?where[state]=string`

street\_line\_1

where[street\_line\_1]

string

Query on a specific street\_line\_1

`?where[street_line_1]=string`

street\_line\_2

where[street\_line\_2]

string

Query on a specific street\_line\_2

`?where[street_line_2]=string`

zip

where[zip]

string

Query on a specific zip

`?where[zip]=string`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/address#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/addresses`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/addresses/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/people/{person_id}/addresses`

Copy

* city
* state
* zip
* country\_code
* location
* primary
* street\_line\_1
* street\_line\_2

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/addresses/{id}`

Copy

* city
* state
* zip
* country\_code
* location
* primary
* street\_line\_1
* street\_line\_2

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/addresses/{id}`

Copy

[# Belongs To](#/apps/people/2025-03-20/vertices/address#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/addresses`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/addresses`

Copy

[Person](person.md)