Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](message.md)

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

# Message

A message is an individual email or sms text sent to a member. Every message has a parent message group.

[# Example Request](#/apps/people/2025-03-20/vertices/message#example-request)

```
curl https://api.planningcenteronline.com/people/v2/messages
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/messages)

[# Example Object](#/apps/people/2025-03-20/vertices/message#example-object)

```
{
  "type": "Message",
  "id": "1",
  "attributes": {
    "kind": "value",
    "to_addresses": "string",
    "subject": "string",
    "delivery_status": "string",
    "reject_reason": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "sent_at": "2000-01-01T12:00:00Z",
    "bounced_at": "2000-01-01T12:00:00Z",
    "rejection_notification_sent_at": "2000-01-01T12:00:00Z",
    "from_name": "string",
    "from_address": "string",
    "read_at": "2000-01-01T12:00:00Z",
    "app_name": "string",
    "message_type": "string",
    "file": "string"
  },
  "relationships": {
    "from": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "to": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "message_group": {
      "data": {
        "type": "MessageGroup",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/message#attributes)

Name

Type

Description

`id`

`primary_key`

`kind`

`string`

Possible values: `email`, `sms`, or `church_center_message`

`to_addresses`

`string`

`subject`

`string`

`delivery_status`

`string`

`reject_reason`

`string`

`created_at`

`date_time`

`sent_at`

`date_time`

`bounced_at`

`date_time`

`rejection_notification_sent_at`

`date_time`

`from_name`

`string`

`from_address`

`string`

`read_at`

`date_time`

`app_name`

`string`

`message_type`

`string`

`file`

`string`

[# Relationships](#/apps/people/2025-03-20/vertices/message#relationships)

Name

Type

Association Type

Note

from

Person

to\_one

to

Person

to\_one

message\_group

MessageGroup

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/message#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

message\_group

include associated message\_group

create and update

include

to

include associated to

create and update

# Order By

Parameter

Value

Type

Description

order

app\_name

string

prefix with a hyphen (-app\_name) to reverse the order

order

bounced\_at

string

prefix with a hyphen (-bounced\_at) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

delivery\_status

string

prefix with a hyphen (-delivery\_status) to reverse the order

order

file

string

prefix with a hyphen (-file) to reverse the order

order

from\_address

string

prefix with a hyphen (-from\_address) to reverse the order

order

from\_name

string

prefix with a hyphen (-from\_name) to reverse the order

order

kind

string

prefix with a hyphen (-kind) to reverse the order

order

reject\_reason

string

prefix with a hyphen (-reject\_reason) to reverse the order

order

rejection\_notification\_sent\_at

string

prefix with a hyphen (-rejection\_notification\_sent\_at) to reverse the order

order

sent\_at

string

prefix with a hyphen (-sent\_at) to reverse the order

order

subject

string

prefix with a hyphen (-subject) to reverse the order

order

to\_addresses

string

prefix with a hyphen (-to\_addresses) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

app\_name

where[app\_name]

string

Query on a specific app\_name

`?where[app_name]=string`

bounced\_at

where[bounced\_at]

date\_time

Query on a specific bounced\_at

`?where[bounced_at]=2000-01-01T12:00:00Z`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

delivery\_status

where[delivery\_status]

string

Query on a specific delivery\_status

`?where[delivery_status]=string`

file

where[file]

string

Query on a specific file

`?where[file]=string`

from\_address

where[from\_address]

string

Query on a specific from\_address

`?where[from_address]=string`

kind

where[kind]

string

Query on a specific kind

Possible values: `email`, `sms`, or `church_center_message`

`?where[kind]=value`

reject\_reason

where[reject\_reason]

string

Query on a specific reject\_reason

`?where[reject_reason]=string`

rejection\_notification\_sent\_at

where[rejection\_notification\_sent\_at]

date\_time

Query on a specific rejection\_notification\_sent\_at

`?where[rejection_notification_sent_at]=2000-01-01T12:00:00Z`

sent\_at

where[sent\_at]

date\_time

Query on a specific sent\_at

`?where[sent_at]=2000-01-01T12:00:00Z`

subject

where[subject]

string

Query on a specific subject

`?where[subject]=string`

to\_addresses

where[to\_addresses]

string

Query on a specific to\_addresses

`?where[to_addresses]=string`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/message#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/messages`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/messages/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/message#associations)

# message\_group

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/messages/{message_id}/message_group`

Copy

[MessageGroup](message_group.md)

# to

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/messages/{message_id}/to`

Copy

[Person](person.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/message#belongs-to)

# MessageGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/message_groups/{message_group_id}/messages`

Copy

[MessageGroup](message_group.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/messages`

Copy

[Organization](organization.md)

* `created_after`

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/people/{person_id}/messages`

Copy

[Person](person.md)

The Person's received messages. Can also receive a filter
to return `sent` or `unread`
e.g. `?filter=sent`

* `created_after`
* `received`
* `sent`
* `unread`