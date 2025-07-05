Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](message_group.md)

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

# MessageGroup

A message group represents one or more emails or text messages sent from one of the Planning Center apps. The message group indicates the from person, app, etc.

[# Example Request](#/apps/people/2025-03-20/vertices/message_group#example-request)

```
curl https://api.planningcenteronline.com/people/v2/message_groups
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/message_groups)

[# Example Object](#/apps/people/2025-03-20/vertices/message_group#example-object)

```
{
  "type": "MessageGroup",
  "id": "1",
  "attributes": {
    "uuid": "string",
    "message_type": "string",
    "from_address": "string",
    "subject": "string",
    "message_count": 1,
    "system_message": true,
    "transactional_message": true,
    "contains_user_generated_content": true,
    "created_at": "2000-01-01T12:00:00Z",
    "reply_to_name": "string",
    "reply_to_address": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/message_group#attributes)

Name

Type

Description

`id`

`primary_key`

`uuid`

`string`

`message_type`

`string`

`from_address`

`string`

`subject`

`string`

`message_count`

`integer`

`system_message`

`boolean`

`transactional_message`

`boolean`

`contains_user_generated_content`

`boolean`

`created_at`

`date_time`

`reply_to_name`

`string`

`reply_to_address`

`string`

[# URL Parameters](#/apps/people/2025-03-20/vertices/message_group#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

app

include associated app

include

from

include associated from

include

messages

include associated messages

# Order By

Parameter

Value

Type

Description

order

contains\_user\_generated\_content

string

prefix with a hyphen (-contains\_user\_generated\_content) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

from\_address

string

prefix with a hyphen (-from\_address) to reverse the order

order

message\_count

string

prefix with a hyphen (-message\_count) to reverse the order

order

message\_type

string

prefix with a hyphen (-message\_type) to reverse the order

order

reply\_to\_address

string

prefix with a hyphen (-reply\_to\_address) to reverse the order

order

reply\_to\_name

string

prefix with a hyphen (-reply\_to\_name) to reverse the order

order

subject

string

prefix with a hyphen (-subject) to reverse the order

order

system\_message

string

prefix with a hyphen (-system\_message) to reverse the order

order

transactional\_message

string

prefix with a hyphen (-transactional\_message) to reverse the order

order

uuid

string

prefix with a hyphen (-uuid) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

contains\_user\_generated\_content

where[contains\_user\_generated\_content]

boolean

Query on a specific contains\_user\_generated\_content

`?where[contains_user_generated_content]=true`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

from\_address

where[from\_address]

string

Query on a specific from\_address

`?where[from_address]=string`

message\_count

where[message\_count]

integer

Query on a specific message\_count

`?where[message_count]=1`

message\_type

where[message\_type]

string

Query on a specific message\_type

`?where[message_type]=string`

reply\_to\_address

where[reply\_to\_address]

string

Query on a specific reply\_to\_address

`?where[reply_to_address]=string`

reply\_to\_name

where[reply\_to\_name]

string

Query on a specific reply\_to\_name

`?where[reply_to_name]=string`

subject

where[subject]

string

Query on a specific subject

`?where[subject]=string`

system\_message

where[system\_message]

boolean

Query on a specific system\_message

`?where[system_message]=true`

transactional\_message

where[transactional\_message]

boolean

Query on a specific transactional\_message

`?where[transactional_message]=true`

uuid

where[uuid]

string

Query on a specific uuid

`?where[uuid]=string`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/message_group#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/message_groups`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/message_groups/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/message_group#associations)

# app

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/message_groups/{message_group_id}/app`

Copy

[App](app.md)

# from

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/message_groups/{message_group_id}/from`

Copy

[Person](person.md)

# messages

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/message_groups/{message_group_id}/messages`

Copy

[Message](message.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/message_group#belongs-to)

# Message

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/messages/{message_id}/message_group`

Copy

[Message](message.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/message_groups`

Copy

[Organization](organization.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/message_groups`

Copy

[Person](person.md)