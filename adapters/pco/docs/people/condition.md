Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](condition.md)

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

# Condition

A condition is an individual criterion used by a List Rule.

[# Example Request](#/apps/people/2025-03-20/vertices/condition#example-request)

```
curl https://api.planningcenteronline.com/people/v2/lists/{list_id}/rules/{rule_id}/conditions
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/people/v2/lists/{list_id}/rules/{rule_id}/conditions)

[# Example Object](#/apps/people/2025-03-20/vertices/condition#example-object)

```
{
  "type": "Condition",
  "id": "1",
  "attributes": {
    "application": "string",
    "definition_class": "string",
    "comparison": "string",
    "settings": "string",
    "definition_identifier": "string",
    "description": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {
    "created_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/people/2025-03-20/vertices/condition#attributes)

Name

Type

Description

`id`

`primary_key`

`application`

`string`

`definition_class`

`string`

`comparison`

`string`

`settings`

`string`

`definition_identifier`

`string`

`description`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

[# Relationships](#/apps/people/2025-03-20/vertices/condition#relationships)

Name

Type

Association Type

Note

created\_by

Person

to\_one

[# URL Parameters](#/apps/people/2025-03-20/vertices/condition#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

created\_by

include associated created\_by

create and update

# Order By

Parameter

Value

Type

Description

order

application

string

prefix with a hyphen (-application) to reverse the order

order

comparison

string

prefix with a hyphen (-comparison) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

definition\_class

string

prefix with a hyphen (-definition\_class) to reverse the order

order

definition\_identifier

string

prefix with a hyphen (-definition\_identifier) to reverse the order

order

description

string

prefix with a hyphen (-description) to reverse the order

order

settings

string

prefix with a hyphen (-settings) to reverse the order

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

application

where[application]

string

Query on a specific application

`?where[application]=string`

comparison

where[comparison]

string

Query on a specific comparison

`?where[comparison]=string`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

definition\_class

where[definition\_class]

string

Query on a specific definition\_class

`?where[definition_class]=string`

definition\_identifier

where[definition\_identifier]

string

Query on a specific definition\_identifier

`?where[definition_identifier]=string`

description

where[description]

string

Query on a specific description

`?where[description]=string`

settings

where[settings]

string

Query on a specific settings

`?where[settings]=string`

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

[# Endpoints](#/apps/people/2025-03-20/vertices/condition#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/people/v2/lists/{list_id}/rules/{rule_id}/conditions`

Copy

# Reading

HTTP Method

Endpoint

GET

`/people/v2/lists/{list_id}/rules/{rule_id}/conditions/{id}`

Copy

[# Associations](#/apps/people/2025-03-20/vertices/condition#associations)

# created\_by

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/people/v2/lists/{list_id}/rules/{rule_id}/conditions/{condition_id}/created_by`

Copy

[Person](person.md)

[# Belongs To](#/apps/people/2025-03-20/vertices/condition#belongs-to)

# Rule

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/people/v2/lists/{list_id}/rules/{rule_id}/conditions`

Copy

[Rule](rule.md)