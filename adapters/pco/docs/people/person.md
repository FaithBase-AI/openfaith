Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](person.md)

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

# Person

A person record represents a single member/user of the application. Each person has different permissions that determine how the user can use this app (if at all).

[# Example Request](#/apps/people/2025-03-20/vertices/person#example-request)

```
curl https://api.planningcenteronline.com/people/v2/people
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/people)

[# Example Object](#/apps/people/2025-03-20/vertices/person#example-object)

```
{
  "type": "Person",
  "id": "1",
  "attributes": {
    "avatar": "string",
    "first_name": "string",
    "last_name": "string",
    "demographic_avatar_url": "string",
    "name": "string",
    "status": "string",
    "remote_id": 1,
    "accounting_administrator": true,
    "anniversary": "2000-01-01",
    "birthdate": "2000-01-01",
    "child": true,
    "given_name": "string",
    "grade": 1,
    "graduation_year": 1,
    "middle_name": "string",
    "nickname": "string",
    "people_permissions": "string",
    "site_administrator": true,
    "gender": "string",
    "inactivated_at": "2000-01-01T12:00:00Z",
    "medical_notes": "string",
    "membership": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "can_create_forms": true,
    "can_email_lists": true,
    "directory_shared_info": {},
    "directory_status": "string",
    "passed_background_check": true,
    "resource_permission_flags": {},
    "school_type": "string",
    "login_identifier": "string",
    "mfa_configured": true,
    "stripe_customer_identifier": "string"
  },
  "relationships": {
    "primary_campus": {
      "data": {
        "type": "PrimaryCampus",
        "id": "1"
      }
    },
    "gender": {
      "data": {
        "type": "Gender",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/person#attributes)

Name

Type

Description

Note

`id`

`primary_key`

`avatar`

`string`

File UUID (see [File Uploads](#file-uploads) section)

`first_name`

`string`

`last_name`

`string`

`demographic_avatar_url`

`string`

`name`

`string`

`status`

`string`

Set to "inactive" to set "inactivated\_at" to the current time and make the profile inactive. Set to anything else to clear "inactivated\_at" and reactivate the profile.

`remote_id`

`integer`

`accounting_administrator`

`boolean`

`anniversary`

`date`

`birthdate`

`date`

`child`

`boolean`

`given_name`

`string`

`grade`

`integer`

`graduation_year`

`integer`

`middle_name`

`string`

`nickname`

`string`

`people_permissions`

`string`

`site_administrator`

`boolean`

`gender`

`string`

`inactivated_at`

`date_time`

Set to an ISO 8601 date or time to make the profile inactive. Set to "null" to reactivate the profile.

`medical_notes`

`string`

`membership`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

`can_create_forms`

`boolean`

`can_email_lists`

`boolean`

`directory_shared_info`

`json`

Only available when requested with the `?fields` param

`directory_status`

`string`

`passed_background_check`

`boolean`

`resource_permission_flags`

`json`

`school_type`

`string`

`login_identifier`

`string`

`mfa_configured`

`boolean`

Only available when requested with the `?fields` param

Set to "true" or "false" to filter. Can only be viewed and queried by an Organization Administrator.

`stripe_customer_identifier`

`string`

Only available when requested with the `?fields` param

[# Relationships](#/apps/people/2025-03-20/vertices/person#relationships)

Name

Type

Association Type

Note

primary\_campus

PrimaryCampus

to\_one

gender

Gender

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/person#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

addresses

include associated addresses

create and update

include

emails

include associated emails

create and update

include

field\_data

include associated field\_data

include

households

include associated households

include

inactive\_reason

include associated inactive\_reason

create and update

include

marital\_status

include associated marital\_status

create and update

include

name\_prefix

include associated name\_prefix

create and update

include

name\_suffix

include associated name\_suffix

create and update

include

organization

include associated organization

include

person\_apps

include associated person\_apps

include

phone\_numbers

include associated phone\_numbers

create and update

include

platform\_notifications

include associated platform\_notifications

include

primary\_campus

include associated primary\_campus

create and update

include

school

include associated school

create and update

include

social\_profiles

include associated social\_profiles

create and update

# Order By

Parameter

Value

Type

Description

order

accounting\_administrator

string

prefix with a hyphen (-accounting\_administrator) to reverse the order

order

anniversary

string

prefix with a hyphen (-anniversary) to reverse the order

order

birthdate

string

prefix with a hyphen (-birthdate) to reverse the order

order

child

string

prefix with a hyphen (-child) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

first\_name

string

prefix with a hyphen (-first\_name) to reverse the order

order

gender

string

prefix with a hyphen (-gender) to reverse the order

order

given\_name

string

prefix with a hyphen (-given\_name) to reverse the order

order

grade

string

prefix with a hyphen (-grade) to reverse the order

order

graduation\_year

string

prefix with a hyphen (-graduation\_year) to reverse the order

order

inactivated\_at

string

prefix with a hyphen (-inactivated\_at) to reverse the order

order

last\_name

string

prefix with a hyphen (-last\_name) to reverse the order

order

membership

string

prefix with a hyphen (-membership) to reverse the order

order

middle\_name

string

prefix with a hyphen (-middle\_name) to reverse the order

order

nickname

string

prefix with a hyphen (-nickname) to reverse the order

order

people\_permissions

string

prefix with a hyphen (-people\_permissions) to reverse the order

order

remote\_id

string

prefix with a hyphen (-remote\_id) to reverse the order

order

site\_administrator

string

prefix with a hyphen (-site\_administrator) to reverse the order

order

status

string

prefix with a hyphen (-status) to reverse the order

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

accounting\_administrator

where[accounting\_administrator]

boolean

Query on a specific accounting\_administrator

`?where[accounting_administrator]=true`

anniversary

where[anniversary]

date

Query on a specific anniversary

`?where[anniversary]=2000-01-01`

birthdate

where[birthdate]

date

Query on a specific birthdate

`?where[birthdate]=2000-01-01`

child

where[child]

boolean

Query on a specific child

`?where[child]=true`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

first\_name

where[first\_name]

string

Query on a specific first\_name

`?where[first_name]=string`

gender

where[gender]

string

Query on a specific gender

`?where[gender]=string`

given\_name

where[given\_name]

string

Query on a specific given\_name

`?where[given_name]=string`

grade

where[grade]

integer

Query on a specific grade

`?where[grade]=1`

graduation\_year

where[graduation\_year]

integer

Query on a specific graduation\_year

`?where[graduation_year]=1`

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

inactivated\_at

where[inactivated\_at]

date\_time

Set to an ISO 8601 date or time to make the profile inactive. Set to "null" to reactivate the profile.

`?where[inactivated_at]=2000-01-01T12:00:00Z`

last\_name

where[last\_name]

string

Query on a specific last\_name

`?where[last_name]=string`

medical\_notes

where[medical\_notes]

string

Query on a specific medical\_notes

`?where[medical_notes]=string`

membership

where[membership]

string

Query on a specific membership

`?where[membership]=string`

mfa\_configured

where[mfa\_configured]

boolean

Set to "true" or "false" to filter. Can only be viewed and queried by an Organization Administrator.

`?where[mfa_configured]=true`

middle\_name

where[middle\_name]

string

Query on a specific middle\_name

`?where[middle_name]=string`

nickname

where[nickname]

string

Query on a specific nickname

`?where[nickname]=string`

people\_permissions

where[people\_permissions]

string

Query on a specific people\_permissions

`?where[people_permissions]=string`

primary\_campus\_id

where[primary\_campus\_id]

integer

Query on a related primary\_campus

`?where[primary_campus_id]=1`

remote\_id

where[remote\_id]

integer

Query on a specific remote\_id

`?where[remote_id]=1`

search\_name

where[search\_name]

string

Query on a specific search\_name

`?where[search_name]=string`

search\_name\_or\_email

where[search\_name\_or\_email]

string

Query on a specific search\_name\_or\_email

`?where[search_name_or_email]=string`

search\_name\_or\_email\_or\_phone\_number

where[search\_name\_or\_email\_or\_phone\_number]

string

Query on a specific search\_name\_or\_email\_or\_phone\_number

`?where[search_name_or_email_or_phone_number]=string`

search\_phone\_number

where[search\_phone\_number]

string

Query on a specific search\_phone\_number

`?where[search_phone_number]=string`

search\_phone\_number\_e164

where[search\_phone\_number\_e164]

string

Query on a specific search\_phone\_number\_e164

`?where[search_phone_number_e164]=string`

site\_administrator

where[site\_administrator]

boolean

Query on a specific site\_administrator

`?where[site_administrator]=true`

status

where[status]

string

Set to "inactive" to set "inactivated\_at" to the current time and make the profile inactive. Set to anything else to clear "inactivated\_at" and reactivate the profile.

`?where[status]=string`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/person#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/people`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/people/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/people/v2/people`

Copy

* accounting\_administrator
* anniversary
* birthdate
* child
* given\_name
* grade
* graduation\_year
* middle\_name
* nickname
* people\_permissions
* site\_administrator
* gender
* inactivated\_at
* medical\_notes
* membership
* stripe\_customer\_identifier
* avatar
* first\_name
* last\_name
* gender\_id
* primary\_campus\_id
* remote\_id
* status

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/people/v2/people/{id}`

Copy

* accounting\_administrator
* anniversary
* birthdate
* child
* given\_name
* grade
* graduation\_year
* middle\_name
* nickname
* people\_permissions
* site\_administrator
* gender
* inactivated\_at
* medical\_notes
* membership
* stripe\_customer\_identifier
* avatar
* first\_name
* last\_name
* gender\_id
* primary\_campus\_id
* remote\_id
* status

# Deleting

HTTP Method

Endpoint

DELETE

`/people/v2/people/{id}`

Copy

[# Actions](#/apps/people/2025-03-20/vertices/person#actions)

# staff\_only\_reset\_age\_checks

HTTP Method

Endpoint

Description

POST

`/people/v2/people/{person_id}/staff_only_reset_age_checks`

Copy

This is a staff only action to help QA.

Permissions:

Must be authenticated

[# Associations](#/apps/people/2025-03-20/vertices/person#associations)

# addresses

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/addresses`

Copy

[Address](address.md)

# apps

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/apps`

Copy

[App](app.md)

# background\_checks

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/background_checks`

Copy

[BackgroundCheck](background_check.md)

# connected\_people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/connected_people`

Copy

[ConnectedPerson](connected_person.md)

# emails

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/emails`

Copy

[Email](email.md)

# field\_data

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/field_data`

Copy

[FieldDatum](field_datum.md)

# household\_memberships

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/household_memberships`

Copy

[HouseholdMembership](household_membership.md)

# households

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/households`

Copy

[Household](household.md)

# inactive\_reason

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/inactive_reason`

Copy

[InactiveReason](inactive_reason.md)

# marital\_status

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/marital_status`

Copy

[MaritalStatus](marital_status.md)

# message\_groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/message_groups`

Copy

[MessageGroup](message_group.md)

# messages

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/messages`

Copy

[Message](message.md)

The Person's received messages. Can also receive a filter
to return `sent` or `unread`
e.g. `?filter=sent`

* `created_after`
* `received`
* `sent`
* `unread`

# name\_prefix

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/name_prefix`

Copy

[NamePrefix](name_prefix.md)

# name\_suffix

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/name_suffix`

Copy

[NameSuffix](name_suffix.md)

# notes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/notes`

Copy

[Note](note.md)

# organization

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/organization`

Copy

[Organization](organization.md)

# person\_apps

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/person_apps`

Copy

[PersonApp](person_app.md)

# phone\_numbers

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/phone_numbers`

Copy

[PhoneNumber](phone_number.md)

# platform\_notifications

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/platform_notifications`

Copy

[PlatformNotification](platform_notification.md)

# primary\_campus

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/primary_campus`

Copy

[Campus](campus.md)

# school

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/school`

Copy

[SchoolOption](school_option.md)

# social\_profiles

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/social_profiles`

Copy

[SocialProfile](social_profile.md)

# workflow\_cards

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards`

Copy

[WorkflowCard](workflow_card.md)

* `assigned`

# workflow\_shares

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_shares`

Copy

[WorkflowShare](workflow_share.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/person#belongs-to)

# BackgroundCheck

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/background_checks/{background_check_id}/person`

Copy

[BackgroundCheck](background_check.md)

# Condition

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/lists/{list_id}/rules/{rule_id}/conditions/{condition_id}/created_by`

Copy

[Condition](condition.md)

# Email

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/emails/{email_id}/person`

Copy

[Email](email.md)

# FieldDatum

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/field_data/{field_datum_id}/person`

Copy

[FieldDatum](field_datum.md)

# FormSubmission

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/forms/{form_id}/form_submissions/{form_submission_id}/person`

Copy

[FormSubmission](form_submission.md)

# HouseholdMembership

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/households/{household_id}/household_memberships/{household_membership_id}/person`

Copy

[HouseholdMembership](household_membership.md)

# Household

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/households/{household_id}/people`

Copy

[Household](household.md)

* `non_pending`
* `without_deceased`

# List

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/lists/{list_id}/created_by`

Copy

[List](list.md)

# List

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/lists/{list_id}/people`

Copy

[List](list.md)

# ListShare

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/lists/{list_id}/shares/{list_share_id}/person`

Copy

[ListShare](list_share.md)

# List

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/lists/{list_id}/updated_by`

Copy

[List](list.md)

# MessageGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/message_groups/{message_group_id}/from`

Copy

[MessageGroup](message_group.md)

# Message

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/messages/{message_id}/to`

Copy

[Message](message.md)

# NoteCategoryShare

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/note_categories/{note_category_id}/shares/{note_category_share_id}/person`

Copy

[NoteCategoryShare](note_category_share.md)

# NoteCategory

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/note_categories/{note_category_id}/subscribers`

Copy

[NoteCategory](note_category.md)

# NoteCategorySubscription

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/note_category_subscriptions/{note_category_subscription_id}/person`

Copy

[NoteCategorySubscription](note_category_subscription.md)

# Note

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/notes/{note_id}/created_by`

Copy

[Note](note.md)

# Note

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/notes/{note_id}/person`

Copy

[Note](note.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people`

Copy

[Organization](organization.md)

* `admins`
* `created_since` — filter people created in the last 24 hours; pass an additional `time` parameter in ISO 8601 format to specify your own timeframe
* `organization_admins`

# PeopleImportHistory

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people_imports/{people_import_id}/histories/{people_import_history_id}/person`

Copy

[PeopleImportHistory](people_import_history.md)

# Report

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/reports/{report_id}/created_by`

Copy

[Report](report.md)

# Report

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/reports/{report_id}/updated_by`

Copy

[Report](report.md)

# SocialProfile

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/social_profiles/{social_profile_id}/person`

Copy

[SocialProfile](social_profile.md)

# WorkflowCard

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/assignee`

Copy

[WorkflowCard](workflow_card.md)

# WorkflowCard

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_cards/{workflow_card_id}/person`

Copy

[WorkflowCard](workflow_card.md)

# WorkflowShare

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/workflow_shares/{workflow_share_id}/person`

Copy

[WorkflowShare](workflow_share.md)

# Workflow

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/shared_people`

Copy

[Workflow](workflow.md)

# WorkflowStepAssigneeSummary

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/steps/{step_id}/assignee_summaries/{workflow_step_assignee_summary_id}/person`

Copy

[WorkflowStepAssigneeSummary](workflow_step_assignee_summary.md)

# WorkflowStep

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/workflows/{workflow_id}/steps/{workflow_step_id}/default_assignee`

Copy

[WorkflowStep](workflow_step.md)